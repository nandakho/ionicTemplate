import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection, capSQLiteChanges, capSQLiteValues, capEchoResult, capSQLiteResult, capNCDatabasePathResult } from '@capacitor-community/sqlite';
import { App } from '@capacitor/app';
import { createSchema } from 'src/app/services/db.schema';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  initDone: boolean = false;
  sql: SQLiteDBConnection;
  sqlite: SQLiteConnection;
  isService: boolean = false;
  platform: string;
  sqlitePlugin: any;
  native: boolean = false;
  dbName: string = "db";
  appVer: version;
  constructor(private pf: Platform) {
    if(!this.initDone){
      App.getInfo().then((info)=>{
        var v = info.version.split("-");
        var vnumber = v[0].split(".");
        v.splice(0,1);
        var vnotes = v.join("-");
        this.appVer = {
          major:parseInt(vnumber[0]),
          minor:parseInt(vnumber[1]),
          patch:parseInt(vnumber[2])
        }
        this.appVer.notes = vnotes?vnotes:null;
        this.init();
      });
    }
  }

  /**
   * Initialize sql property
   */
  init(){
    this.pf.ready().then(async () => {
      this.initializePlugin().then(async () => {
        this.checkConnectionsConsistency().then(async ok=>{
          if(ok.result==false){
            this.sql = await this.createConnection(this.dbName,false,'no-encryption',1);
            await this.sql.open();
            let resp: any = await this.sql.execute(createSchema);
            this.sql.query('SELECT * FROM users').then(res=>{
              console.log(res.values);
            });
            console.log('$$$ ret.changes.changes in db ' + resp.changes.changes);
            if (resp.changes.changes < 0) {
              console.log('Execute createSchema failed');
            }
          }
          this.initDone = true;
        }).catch(er=>{
          console.log(er);
        });
      });
    });
  }

  async select(opt:selectOption):Promise<any[]>{
    var selected = opt.what.join(",");
    if(opt.distinct===true){
      selected = " DISTINCT "+selected;
    }
    var q = `SELECT ${selected} FROM ${opt.from}`;
    if(opt.where){
      q +=` WHERE `+opt.where;
    }
    if(opt.orderby){
      q += ` ORDER BY `+opt.orderby;
      if(opt.orderdir){
        q += " "+opt.orderdir;
      }
    }
    console.log(q);
    try {
      const result = await this.sql.query(q);
      return Promise.resolve(result.values);
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  /**
   * Show app version in number, useful for comparison
   * @returns number
   */
  versionNumber(): number {
    return (this.appVer.major*10000) + (this.appVer.minor*100) + (this.appVer.patch);
  }
  
  /**
   * Show app version in string
   * @returns string
   */
  versionString(): string {
    return this.appVer.major.toString() + '.' + this.appVer.minor.toString() + '.' + this.appVer.patch.toString();
  }

  /**
   * Plugin Initialization
   */
  initializePlugin(): Promise<boolean> {
    return new Promise(resolve => {
      this.platform = Capacitor.getPlatform();
      if (this.platform === 'ios' || this.platform === 'android')
        this.native = true;
      this.sqlitePlugin = CapacitorSQLite;
      this.sqlite = new SQLiteConnection(this.sqlitePlugin);
      this.isService = true;
      resolve(true);
    });
  }

  /**
   * Echo a value
   * @param value
   */
  async echo(value: string): Promise<capEchoResult> {
    if (this.sqlite != null) {
      try {
        const ret = await this.sqlite.echo(value);
        return Promise.resolve(ret);
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error('no connection open'));
    }
  }

  async isSecretStored(): Promise<capSQLiteResult> {
    if (!this.native) {
      return Promise.reject(
        new Error(`Not implemented for ${this.platform} platform`),
      );
    }
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.isSecretStored());
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  async setEncryptionSecret(passphrase: string): Promise<void> {
    if (!this.native) {
      return Promise.reject(
        new Error(`Not implemented for ${this.platform} platform`),
      );
    }
    if (this.sqlite != null) {
      try {
        return Promise.resolve(
          await this.sqlite.setEncryptionSecret(passphrase),
        );
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  async changeEncryptionSecret(
    passphrase: string,
    oldpassphrase: string,
  ): Promise<void> {
    if (!this.native) {
      return Promise.reject(
        new Error(`Not implemented for ${this.platform} platform`),
      );
    }
    if (this.sqlite != null) {
      try {
        return Promise.resolve(
          await this.sqlite.changeEncryptionSecret(passphrase, oldpassphrase),
        );
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * addUpgradeStatement
   * @param database
   * @param toVersion
   * @param statement
   * @param set
   */
  async addUpgradeStatement(
    database: string,
    toVersion: number,
    statements: string[],
  ): Promise<void> {
    if (this.sqlite != null) {
      try {
        await this.sqlite.addUpgradeStatement(database, toVersion, statements);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open for ${database}`));
    }
  }

  /**
   * get a non-conformed database path
   * @param path
   * @param database
   * @returns Promise<capNCDatabasePathResult>
   * @since 3.3.3-1
   */
  async getNCDatabasePath(
    folderPath: string,
    database: string,
  ): Promise<capNCDatabasePathResult> {
    if (this.sqlite != null) {
      try {
        const res: capNCDatabasePathResult = await this.sqlite.getNCDatabasePath(
          folderPath,
          database,
        );
        return Promise.resolve(res);
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open for ${database}`));
    }
  }

  /**
   * Create a non-conformed database connection
   * @param databasePath
   * @param version
   * @returns Promise<SQLiteDBConnection>
   * @since 3.3.3-1
   */
  async createNCConnection(
    databasePath: string,
    version: number,
  ): Promise<SQLiteDBConnection> {
    if (this.sqlite != null) {
      try {
        const db: SQLiteDBConnection = await this.sqlite.createNCConnection(
          databasePath,
          version,
        );
        if (db != null) {
          return Promise.resolve(db);
        } else {
          return Promise.reject(new Error(`no db returned is null`));
        }
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(
        new Error(`no connection open for ${databasePath}`),
      );
    }
  }

  /**
   * Close a non-conformed database connection
   * @param databasePath
   * @returns Promise<void>
   * @since 3.3.3-1
   */
  async closeNCConnection(databasePath: string): Promise<void> {
    if (this.sqlite != null) {
      try {
        await this.sqlite.closeNCConnection(databasePath);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(
        new Error(`no connection open for ${databasePath}`),
      );
    }
  }

  /**
   * Check if a non-conformed databaseconnection exists
   * @param databasePath
   * @returns Promise<capSQLiteResult>
   * @since 3.3.3-1
   */
  async isNCConnection(databasePath: string): Promise<capSQLiteResult> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.isNCConnection(databasePath));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Retrieve a non-conformed database connection
   * @param databasePath
   * @returns Promise<SQLiteDBConnection>
   * @since 3.3.3-1
   */
  async retrieveNCConnection(
    databasePath: string,
  ): Promise<SQLiteDBConnection> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(
          await this.sqlite.retrieveNCConnection(databasePath),
        );
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(
        new Error(`no connection open for ${databasePath}`),
      );
    }
  }

  /**
   * Check if a non conformed database exists
   * @param databasePath
   * @returns Promise<capSQLiteResult>
   * @since 3.3.3-1
   */
  async isNCDatabase(databasePath: string): Promise<capSQLiteResult> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.isNCDatabase(databasePath));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }
  
  /**
   * Create a connection to a database
   * @param database
   * @param encrypted
   * @param mode
   * @param version
   */
  async createConnection(
    database: string,
    encrypted: boolean,
    mode: string,
    version: number,
  ): Promise<SQLiteDBConnection> {
    if (this.sqlite != null) {
      try {
        const db: SQLiteDBConnection = await this.sqlite.createConnection(
          database,
          encrypted,
          mode,
          version,
        );
        if (db != null) {
          return Promise.resolve(db);
        } else {
          return Promise.reject(new Error(`no db returned is null`));
        }
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open for ${database}`));
    }
  }

  /**
   * Close a connection to a database
   * @param database
   */
  async closeConnection(database: string): Promise<void> {
    if (this.sqlite != null) {
      try {
        await this.sqlite.closeConnection(database);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open for ${database}`));
    }
  }

  /**
   * Retrieve an existing connection to a database
   * @param database
   */
  async retrieveConnection(database: string): Promise<SQLiteDBConnection> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.retrieveConnection(database));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open for ${database}`));
    }
  }

  /**
   * Retrieve all existing connections
   */
  async retrieveAllConnections(): Promise<Map<string, SQLiteDBConnection>> {
    if (this.sqlite != null) {
      try {
        const myConns = await this.sqlite.retrieveAllConnections();
        /*
          let keys = [...myConns.keys()];
          keys.forEach( (value) => {
            console.log("Connection: " + value);
          });
        */
        return Promise.resolve(myConns);
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Close all existing connections
   */
  async closeAllConnections(): Promise<void> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.closeAllConnections());
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Check if connection exists
   * @param database
   */
  async isConnection(database: string): Promise<capSQLiteResult> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.isConnection(database));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Check Connections Consistency
   * @returns
   */
  async checkConnectionsConsistency(): Promise<capSQLiteResult> {
    if (this.sqlite != null) {
      try {
        const res = await this.sqlite.checkConnectionsConsistency();
        return Promise.resolve(res);
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Check if database exists
   * @param database
   */
  async isDatabase(database: string): Promise<capSQLiteResult> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.isDatabase(database));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Get the list of databases
   */
  async getDatabaseList(): Promise<capSQLiteValues> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.getDatabaseList());
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Get Migratable databases List
   */
  async getMigratableDbList(folderPath?: string): Promise<capSQLiteValues> {
    if (!this.native) {
      return Promise.reject(
        new Error(`Not implemented for ${this.platform} platform`),
      );
    }
    if (this.sqlite != null) {
      try {
        if (!folderPath || folderPath.length === 0) {
          return Promise.reject(new Error(`You must provide a folder path`));
        }
        return Promise.resolve(
          await this.sqlite.getMigratableDbList(folderPath),
        );
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Add "SQLite" suffix to old database's names
   */
  async addSQLiteSuffix(
    folderPath?: string,
    dbNameList?: string[],
  ): Promise<void> {
    if (!this.native) {
      return Promise.reject(
        new Error(`Not implemented for ${this.platform} platform`),
      );
    }
    if (this.sqlite != null) {
      try {
        const path: string = folderPath ? folderPath : 'default';
        const dbList: string[] = dbNameList ? dbNameList : [];
        return Promise.resolve(await this.sqlite.addSQLiteSuffix(path, dbList));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }
  
  /**
   * Delete old databases
   */
  async deleteOldDatabases(
    folderPath?: string,
    dbNameList?: string[],
  ): Promise<void> {
    if (!this.native) {
      return Promise.reject(
        new Error(`Not implemented for ${this.platform} platform`),
      );
    }
    if (this.sqlite != null) {
      try {
        const path: string = folderPath ? folderPath : 'default';
        const dbList: string[] = dbNameList ? dbNameList : [];
        return Promise.resolve(
          await this.sqlite.deleteOldDatabases(path, dbList),
        );
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Import from a Json Object
   * @param jsonstring
   */
  async importFromJson(jsonstring: string): Promise<capSQLiteChanges> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.importFromJson(jsonstring));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Is Json Object Valid
   * @param jsonstring Check the validity of a given Json Object
   */

  async isJsonValid(jsonstring: string): Promise<capSQLiteResult> {
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.isJsonValid(jsonstring));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Copy databases from public/assets/databases folder to application databases folder
   */
  async copyFromAssets(overwrite?: boolean): Promise<void> {
    const mOverwrite: boolean = overwrite != null ? overwrite : true;
    console.log(`&&&& mOverwrite ${mOverwrite}`);
    if (this.sqlite != null) {
      try {
        return Promise.resolve(await this.sqlite.copyFromAssets(mOverwrite));
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Initialize the Web store
   * @param database
   */
  async initWebStore(): Promise<void> {
    if (this.platform !== 'web') {
      return Promise.reject(
        new Error(`not implemented for this platform: ${this.platform}`),
      );
    }
    if (this.sqlite != null) {
      try {
        await this.sqlite.initWebStore();
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open`));
    }
  }

  /**
   * Save a database to store
   * @param database
   */
  async saveToStore(database: string): Promise<void> {
    if (this.platform !== 'web') {
      return Promise.reject(
        new Error(`not implemented for this platform: ${this.platform}`),
      );
    }
    if (this.sqlite != null) {
      try {
        await this.sqlite.saveToStore(database);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(new Error(err));
      }
    } else {
      return Promise.reject(new Error(`no connection open for ${database}`));
    }
  }
}

interface version {
  major: number;
  minor: number;
  patch: number;
  notes?: string;
}

export interface selectOption {
  what: string[];
  distinct?: boolean;
  from: string;
  where?: string;
  orderby?: string;
  orderdir?: "ASC"|"DESC";
}