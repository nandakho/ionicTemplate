import { Injectable } from '@angular/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  dbName: string = "db";
  appVer: version = {
    major:0,
    minor:0,
    patch:1
  };
  constructor() { 
    CapacitorSQLite.isDBExists({database:this.dbName}).then(exist=>{
      console.log(exist);
    }).catch(err=>{
      console.log(err);
    })
  }
}

interface version {
  major: number;
  minor: number;
  patch: number;
}
