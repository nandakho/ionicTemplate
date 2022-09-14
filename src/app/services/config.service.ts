import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() { }

  async writeConfig(key:string,value:Object):Promise<boolean>{
    try {
      await Preferences.set({key:key,value:JSON.stringify(value)});
      return Promise.resolve(true);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  async readConfig(key:string):Promise<Object>{
    try {
      const res = await Preferences.get({key:key});
      return Promise.resolve(JSON.parse(res.value));
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  async deleteConfig(key:string):Promise<boolean>{
    try {
      await Preferences.remove({key:key});
      return Promise.resolve(true);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }
}
