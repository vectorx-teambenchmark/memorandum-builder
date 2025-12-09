import axios from "axios";
import { Plugin } from "ckeditor5";

export class RevisionHistoryAdapter extends Plugin {
    static get pluginName() {
        return 'RevisionHistoryAdapteer';
    }
    static get requires() {
        return ['RevisionHistory'];
    }

    async init() {
        const revisionHistory = this.editor.plugins.get('RevisionHistory');
        revisionHistory.adapter = {
            getRevision: ({ revisionId }) => {
                return this._findRevision( revisionId );
            },
            updateRevisions: revisionsData => {
                const documentData = this.editor.getData();
                return Promise.reject('Not implemented yet');
            }
        };

        const revisionsData  = await this._fetchRevisionsData();
        for ( const revisionData of revisionsData ) {
            revisionHistory.addRevisionData( revisionData );
        }
    }

    async _findRevision( revisionId ) {
        return Promise.reject('Not implemented yet');
    }

    async _fetchRevisionsData() {
        return Promise.reject('Not implemented yet');
    }
}