import axios from "axios";
import { Plugin } from "ckeditor5";

export class RevisionHistoryAdapter extends Plugin {
    constructor(editor) {
        super();
        this.editor = editor;
    }

    static get pluginName() {
        return "RevisionHistoryAdapter";
    }

    static get requires() {
        return ['RevisionHistory'];
    }

    async init() {
        const revisionHistory = this.editor.plugins.get('RevisionHistory');

        this.baseUri = this.editor.config.get('salesforceApi').baseUri;
        this.accessToken = this.editor.config.get('salesforceApi').accessToken;
        this.currentRecordId = this.editor.config.get('salesforceApi').contentId;

        revisionHistory.adapter = {
            getRevision: ({ revisionId }) => {
                return this._findRevision( revisionId );
            },
            updateRevisions: revisionsData => {

            }
        };

        const revisionsData = await this._fetchReivisionsData();

        for (const revisionData of revisionsData) {
            revisionHistory.addRevisionData( revisionData )
        }
    }

    async _findRevision(revisionId) {
        console.log('Fetching revision with ID:', revisionId);
        return Promise.resolve(null);
    }
    async _fetchReivisionsData() {
        return Promise.reject('There is no data available');
    }
}