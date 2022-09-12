import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() { }

  init(){
  }

  checkLogin(){
    var promise = new Promise((resolve,reject)=>{
      Preferences.get({
        key:'currentUser'
      }).then(log=>{
        resolve(log);
      }).catch(err=>{
        reject(err);
      });
    });
    return promise;
  }

  writeConfig(key:string,value:any){
    var promise = new Promise((resolve,reject)=>{
      Preferences.set({
        key:key,
        value: value
      }).then(()=>{
        resolve(true);
      }).catch(err=>{
        reject(err);
      })
    });
    return promise;
  }

  readConfig(key:string){
    var promise = new Promise((resolve,reject)=>{
      Preferences.get({
        key:key
      }).then(config=>{
        resolve(config);
      }).catch(err=>{
        reject(err);
      })
    });
    return promise;
  }
}
