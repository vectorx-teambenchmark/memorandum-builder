import axios from "axios";
import { Plugin } from "ckeditor5";

export class RevisionHistoryAdapter extends Plugin {
    static get pluginName() {
        return 'RevisionHistoryAdapter';
    }
    static get requires() {
        return ['RevisionHistory'];
    }

    async init() {
        const salesforceConfig = this.editor.config.get('salesforceApi');
        this.baseUri = salesforceConfig.baseUri;
        this.accessToken = salesforceConfig.accessToken;
        this.currentRecordId = salesforceConfig.contentId;
        
        // Ensure we handle currentUserUri correctly if present
        if (salesforceConfig.currentUserUri) {
            try {
                let idUrl = new URL(salesforceConfig.currentUserUri);
                this.currentUserId = idUrl.pathname.split('/').pop();
            } catch (e) {
                console.warn('Could not parse currentUserUri', e);
            }
        }

        const revisionHistory = this.editor.plugins.get('RevisionHistory');
        
        this.revisionsCache = new Map();

        revisionHistory.adapter = {
            getRevision: (data) => {
                return this.getRevision(data);
            },
            updateRevisions: (revisionsData) => {
                return this.updateRevisions(revisionsData);
            }
        };

        try {
            const revisionsData = await this._fetchRevisionsData();
            for ( const revisionData of revisionsData ) {
                revisionHistory.addRevisionData( revisionData );
                this.revisionsCache.set(revisionData.id, revisionData);
            }
        } catch (error) {
            console.error('Failed to initialize revision history:', error);
        }
    }

    async getRevision({ revisionId }) {
        if (this.revisionsCache.has(revisionId)) {
            return Promise.resolve(this.revisionsCache.get(revisionId));
        }
        return Promise.reject(`Revision ${revisionId} not found in cache`);
    }

    async updateRevisions(revisionsData) {
        const recordsToUpsert = [];
        const validRevisions = [];

        for (const rev of revisionsData) {
            // Merge with existing cache if available (handle partial updates)
            let fullRevisionData = { ...rev };
            if (this.revisionsCache.has(rev.id)) {
                fullRevisionData = { ...this.revisionsCache.get(rev.id), ...rev };
            }
            
            // Update cache immediately
            this.revisionsCache.set(rev.id, fullRevisionData);
            validRevisions.push({ id: rev.id, createdAt: fullRevisionData.createdAt || new Date() });

            // Prepare Salesforce record
            const { id, name, ...otherProps } = fullRevisionData;
            
            // Ensure any dates in otherProps are strings or handled
            const dataString = JSON.stringify(otherProps);
            
            recordsToUpsert.push({
                attributes: { type: 'MemorandumContentRevision__c' },
                Name: id,
                RevisionName__c: name,
                ParentId__c: this.currentRecordId,
                Data__c: dataString
            });
        }

        const compositeUrl = `${this.baseUri}/services/data/v59.0/composite/sobjects/MemorandumContentRevision__c/Name`;
        const payload = {
            allOrNone: true,
            records: recordsToUpsert
        };

        try {
            await axios.patch(compositeUrl, payload, {
                headers: { 'authorization': `Bearer ${this.accessToken}` }
            });
            // Return objects with id and createdAt as per spec
            // The spec says createdAt should be what the backend set, but since we are relying on Data__c persistence or client time, 
            // we return what we have (or what we generated).
            // Salesforce CreatedDate is usually set by system on insert, but we are using Upsert.
            // Ideally we'd read back the CreatedDate, but composite response is lean.
            // We'll proceed with Client time / preserved time.
            return Promise.resolve(validRevisions);
        } catch (e) {
            console.error('Error updating revisions:', e);
            return Promise.reject(e);
        }
    }

    async _fetchRevisionsData() {
        const query = `SELECT Name, RevisionName__c, ParentId__c, Data__c, CreatedDate FROM MemorandumContentRevision__c WHERE ParentId__c = '${this.currentRecordId}'`;
        const queryUrl = `${this.baseUri}/services/data/v59.0/query?q=${encodeURIComponent(query)}`;
        
        try {
            const response = await axios.get(queryUrl, {
                headers: { 'authorization': `Bearer ${this.accessToken}` },
                responseType: 'json'
            });

            return response.data.records.map(record => {
                let dataProps = {};
                try {
                    if (record.Data__c) {
                        dataProps = JSON.parse(record.Data__c);
                    }
                } catch (parseError) {
                    console.warn(`Failed to parse Data__c for revision ${record.Name}`, parseError);
                }

                // Construct RevisionData object
                const revision = {
                    id: record.Name,
                    name: record.RevisionName__c,
                    ...dataProps
                };

                // Ensure createdAt is a Date object. 
                if (revision.createdAt) {
                    revision.createdAt = new Date(revision.createdAt);
                } else {
                    revision.createdAt = new Date(record.CreatedDate);
                }

                return revision;
            });
        } catch (e) {
            console.error('Error fetching revisions:', e);
            return []; // Return empty array to allow editor to load even if history fails
        }
    }
}