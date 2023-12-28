import axios from "axios";

export class CommentsAdapter {
    constructor(editor) {
        this.editor = editor;
    }
    static get requires() {
        return ['CommentsRepository'];
    }
    async getUserData() {
        let baseUrl = this.editor.config.get('salesforceApi').baseUri;
        let accessToken = this.editor.config.get('salesforceApi').accessToken;
        let userQuery = encodeURIComponent('SELECT Id, Name, Alias, Username FROM User WHERE IsActive=true AND IsPortalEnabled=false');
        let userQueryEndpoint = `${baseUrl}/services/data/v59.0/query?q=${userQuery}`;
        try {
            let userQueryResponse = await axios({
                method: 'get',
                url: userQueryEndpoint,
                responseType: 'json',
                headers: {'authorization':`Bearer ${accessToken}`}
            });
            let userArray = userQueryResponse.data.records.map(record => {
                return { id: record.Id, name: record.Name };
            });
            return userArray;
        } catch(e) {
            console.log('There was a problem obtaining users: %s',JSON.stringify(e,null,"\t"));
        }
    }

    async init() {
        const usersPlugin = this.editor.plugins.get('Users');
        const commentsRepositoryPlugin = this.editor.plugins.get('CommentsRepository');

        //need to load the users data
        let userArray =  await this.getUserData();
        userArray.forEach( user => {
            usersPlugin.addUser( user );
        });

        //need to set the current user
        let idUrl = new URL(this.editor.config.get('salesforceApi').currentUserUri)
        const currentUserId = idUrl.pathname.split('/').pop();
        this.currentUserId = currentUserId;
        this.baseUri = this.editor.config.get('salesforceApi').baseUri;
        this.accessToken = this.editor.config.get('salesforceApi').accessToken;
        usersPlugin.defineMe(currentUserId);


        //need to set the adapter on the CommentsRepository#adapter property
        commentsRepositoryPlugin.adapter = {
            baseUri: this.editor.config.get('salesforceApi').baseUri,
            accessToken: this.editor.config.get('salesforceApi').accessToken,
            addCommment(data){
                return Promise.reject( `Add Comment Not implemented yet. ${JSON.stringify(data,null,"\t")}`);
            },
            updateComment(data){
                return Promise.reject( `Update Comment Not implemented yet. ${JSON.stringify(data,null,"\t")}`);
            },
            removeComment(data){
                return Promise.reject( `Remove Comment Not implemented yet. ${JSON.stringify(data,null,"\t")}`);
            },
            addCommentThread(data){
                //transform into an array of Salesforce objects for a compsite upsert of MemorandumContentComment__c objects
                const currentThreadId = data.threadId;
                let recordArray = data.comments.map(comment => {
                    let retObj = { attributes: { type: 'MemorandumContentComment__c' }, OwnerId: comment.authorId, 
                        ThreadId__c:currentThreadId, ExternalCommentId__c: comment.commentId, Content__c: comment.content
                    }
                    return retObj;
                });
                let compositeData = { allOrNone: true, records:recordArray };
                let compsiteUpsertUrl = `${this.baseUri}/services/data/v59.0/composite/sobjects/MemorandumContentComment__c/ExternalCommentId__c`;
                axios.patch(compsiteUpsertUrl,compositeData,{headers:{'authorization':` Bearer ${this.accessToken}`}}).then(()=>{
                        return Promise.resolve(data);
                    }).catch((e)=>{
                        return Promise.reject('There was a problem saving the comment thread.%s',JSON.stringify(e,null,"\t"));
                    });
            },
            async getCommentThread(data){
                let commentQuery = encodeURIComponent(`SELECT Id, ExternalCommentId__c, ThreadId__c, Content__c, OwnerId, CreatedDate FROM MemorandumContentComment__c WHERE ThreadId__c ='${data.threadId}' ORDER BY CreatedDate ASC`);
                let commentQueryUrl = `${this.baseUri}/services/data/v59.0/query?q=${commentQuery}`;
                try {
                    let response = axios({
                        method:'get',
                        url:commentQueryUrl,
                        headers:{'authorization':`Bearer ${this.accessToken}`}
                    });
                    let retObj = {threadId: data.threadId, attributes:{}};
                    retObj.comments = response.data.records.map(record => {
                        return { commentId:record.ExternalCommentId__c, authorId:record.OwnerId, createdAt:record.CreatedDate, content: record.Content__c };
                    });
                    return Promise.resolve(retObj);
                } catch(e) {
                    return Promise.reject( `There was an error. ${JSON.stringify(e,null,"\t")}`);
                }
            },
            updateCommentThread(data){
                return Promise.reject( `Update Comment Thread Not implemented yet. ${JSON.stringify(data,null,"\t")}`);
            },
            resolveCommentThread(data){
                return Promise.reject( `Resolve comment thread Not implemented yet. ${JSON.stringify(data)}`);
            }
        };
    }
}