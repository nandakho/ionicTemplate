import { Injectable } from '@angular/core';
import { Http, HttpHeaders, HttpResponse } from '@capacitor-community/http';
import { DbService, AuthService, ConfigService, MiscService } from '.';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiAddr: string = 'http://localhost';
  apiPath = "/api/";
  apiConnected: 0|1 = 0;
  apiRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private db: DbService,
    private auth: AuthService,
    private config: ConfigService,
    private misc: MiscService
  ) { }

  /**
   * Check if client can connect with API Server
   * @param url URL of API Server
   * @returns Promise<HttpResponse>
   */
  async connectTest(url: string): Promise<HttpResponse>{
    try {
      const response = await Http.request({
        url:url+this.apiPath+"ping/",
        method:"POST",
        headers:this.headerConstruct()
      });
      if(response.status.toString()[0]=="2"){
        if(response.data.app!=this.db.appId){
          return Promise.reject("Error: 400 Alamat server tidak valid!");
        }
        if(!response.data.access){
          return Promise.reject("Error: 401 Tidak memiliki otorisasi!");
        }
        return Promise.resolve(response);
      }
      return Promise.reject("Error: "+response.status+" "+response.data);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get latest database from server
   * @param what What database will be synced
   * @returns Promise<HttpResponse>
   */
  async syncSomething(what: string): Promise<HttpResponse>{
    const addr = await this.config.readConfig('apiAddress');
    if(addr){
      this.apiAddr = addr['address'];
    }
    try {
      const resp = await Http.request({
        url: this.apiAddr+this.apiPath+"sync/"+what,
        method: "POST",
        headers: this.headerConstruct()
      });
      return Promise.resolve(resp);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Download file from server
   * @param what Name of the file
   * @returns Promise<boolean>
   */
  async downloadSomething(what: string): Promise<boolean>{
    const addr = await this.config.readConfig('apiAddress');
    if(addr){
      this.apiAddr = addr['address'];
    }
    try {
      const localSize = await this.misc.downloadExist(what);
      const checkSize = await Http.request({
        url: this.apiAddr+this.apiPath+"size_check/"+what,
        method: "POST",
        headers: this.headerConstruct()
      });
      if(checkSize.data.exist==false){
        return Promise.reject("File "+what+" tidak ditemukan!");
      }
      const onlineSize: number = checkSize.data.size;
      if(onlineSize!=localSize){
        await Http.downloadFile({
          url: this.apiAddr+this.apiPath+"download",
          method: "GET",
          headers: this.headerConstruct(),
          params: {
            file: what
          },
          filePath: "download/"+what,
          fileDirectory: Directory.External
        });
      }
      return Promise.resolve(true);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Will generate http request header for you
   * @returns HttpHeaders
   */
  headerConstruct():HttpHeaders{
    var header:HttpHeaders = {
      username: this.auth.loggedUser.username,
      password: this.auth.loggedUser.password,
      clientver: this.db.versionNumber().toString(),
      package: this.db.appId
    };
    return header;
  }
}