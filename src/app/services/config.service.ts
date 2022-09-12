import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() { }

  writeConfig(key:string,value:string){
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
        resolve(config.value);
      }).catch(err=>{
        reject(err);
      })
    });
    return promise;
  }
}
