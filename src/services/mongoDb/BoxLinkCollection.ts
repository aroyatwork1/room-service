import {
  MongoClient, Collection, Db, MongoError,
} from 'mongodb';
import BoxCalendarLink from '../../classes/BoxCalendarLink';

export default abstract class BoxLinkCollection {
  private static mongoDbCollection: Collection;

  private static mongoDbDatabase: Db;

  private static mongoDbClient: MongoClient;

  private static isCollectionOpen(): boolean {
    if (this.mongoDbCollection) {
      return true;
    }
    return false;
  }

  /**
  * Opens the collection if it isn't already opened
  * If it doesn't exists it will also create it
  */
  private static async openCollection(): Promise<void> {
    if (this.isCollectionOpen()) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      if (typeof process.env.MONGODB_URI !== 'string' || typeof process.env.MONGODB_DATABASE !== 'string') {
        reject(new Error('invalid mongoDb configuration'));
      }
      MongoClient.connect(
        `${process.env.MONGODB_URI}`,
        { useUnifiedTopology: true },
        (err: MongoError, client: MongoClient) => {
          if (err != null) {
            reject(err);
          }
          this.mongoDbClient = client;
          this.mongoDbDatabase = client.db(process.env.MONGODB_DATABASE);
          this.mongoDbCollection = this.mongoDbDatabase.collection('BoxLinkCollection');
          resolve();
        },
      );
    });
  }

  public static async saveBoxLink(boxCalendarLink: BoxCalendarLink): Promise<void> {
    if (!boxCalendarLink.boxId) {
      throw new Error('no boxID');
    }
    if (!this.isCollectionOpen()) {
      await this.openCollection();
    }
    await this.mongoDbCollection.updateOne(
      { boxId: boxCalendarLink.boxId },
      { $set: boxCalendarLink },
      { upsert: true },
    );
  }

  /**
   * search in the database collection for a calendarBoxLink with given boxId
   * @param boxId the id that needs to be retrieved by the function.
   */
  public static async findBoxLink(boxId: string): Promise<BoxCalendarLink> {
    return new Promise<BoxCalendarLink>((resolve, reject) => {
      this.openCollection().then(async () => {
        const entry = await this.mongoDbCollection.findOne({ boxId });
        if (entry == null) {
          reject(new Error(`No box calendar link found for the boxId: ${boxId}`));
        }
        const boxCalendarLink = new BoxCalendarLink(entry.boxId, entry.calendarId, entry.refreshToken);
        resolve(boxCalendarLink);
      }).catch((err) => { reject(err); });
    });
  }

  /**
   * Search and delete database entry.
   * @param boxId The box id that needs to be deleted from the database collection.
   * @returns The amount of entries deleted.
   */
  public static async deleteBoxLink(boxId: string): Promise<number> {
    await this.openCollection();
    const operation = await this.mongoDbCollection.deleteOne({ boxId });
    if (operation.result.ok && (typeof operation.deletedCount === 'number')) {
      return operation.deletedCount;
    }
    throw Error('database collection delete operation failed');
  }

  /**
   * retrieve all boxLinks in the database.
   */
  public static async findAllBoxLinks(): Promise<BoxCalendarLink[]> {
    await this.openCollection();
    const entries = this.mongoDbCollection.find();
    const allBoxCalendarLinks = await entries.map(
      (entry) => new BoxCalendarLink(entry.boxId, entry.calendarId, entry.refreshToken),
    ).toArray();
    return allBoxCalendarLinks;
  }

  public static async closeMongoDbConnection(): Promise<void> {
    if (this.mongoDbClient && this.mongoDbClient.isConnected()) {
      await this.mongoDbClient.close();
      delete this.mongoDbClient;
      delete this.mongoDbCollection;
      delete this.mongoDbDatabase;
    }
  }
}
