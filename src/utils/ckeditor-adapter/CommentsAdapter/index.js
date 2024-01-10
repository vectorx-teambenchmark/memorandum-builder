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
        let idUrl = new URL(this.editor.config.get('salesforceApi').currentUserUri);
        const currentUserId = idUrl.pathname.split('/').pop();
        this.currentUserId = currentUserId;
        this.baseUri = this.editor.config.get('salesforceApi').baseUri;
        this.accessToken = this.editor.config.get('salesforceApi').accessToken;
        this.currentRecordId = this.editor.config.get('salesforceApi').contentId;
        usersPlugin.defineMe(currentUserId);


        //need to set the adapter on the CommentsRepository#adapter property
        commentsRepositoryPlugin.adapter = {
            baseUri: this.editor.config.get('salesforceApi').baseUri,
            accessToken: this.editor.config.get('salesforceApi').accessToken,
            currentUser: this.currentUserId,
            currentRecordId: this.currentRecordId,
            async addComment(data){
                let dataObj = { Content__c: data.content, ThreadId__c: data.threadId, Parent__c: this.currentRecordId };
                let createCommentUrl = `${this.baseUri}/services/data/v59.0/sobjects/MemorandumContentComment__c/ExternalCommentId__c/${data.commentId}`;
                try {
                    await axios.patch(createCommentUrl,dataObj,{
                        headers:{'authorization':`Bearer ${this.accessToken}`}
                    });
                    let retObj = {commentId: data.commentId, createdAt: new Date() };
                    Promise.resolve(retObj);
                } catch(e) {
                    return Promise.reject(e);
                }
            },
            async updateComment(data){
                //only update if data containts contents changes 
                if(data?.content !== undefined){
                    let dataObj = { Content__c: data.content, ThreadId__c: data.threadId };
                    let createCommentUrl = `${this.baseUri}/services/data/v59.0/sobjects/MemorandumContentComment__c/ExternalCommentId__c/${data.commentId}`;
                    try {
                        await axios.patch(createCommentUrl,dataObj,{
                            headers:{'authorization':`Bearer ${this.accessToken}`}
                        });
                        Promise.resolve();
                    } catch(e) {
                        return Promise.reject(e);
                    }
                } else {
                    return Promise.resolve();
                }
            },
            async removeComment(data){
                let deleteCommentUrl = `${this.baseUri}/services/data/v59.0/sobjects/MemorandumContentComment__c/ExternalCommentIdd__c/${data.commentId}`;
                try {
                    await axios.delete(deleteCommentUrl,{
                        headers:{'authorization':`Bearer ${this.accessToken}`}
                    });
                    return Promise.resolve();
                } catch(e) {
                    return Promise.reject(e);
                }
            },
            async addCommentThread(data){
                //transform into an array of Salesforce objects for a compsite upsert of MemorandumContentComment__c objects
                const currentThreadId = data.threadId;
                const recId = this.currentRecordId;
                console.log('Record ID: %s',JSON.stringify(recId,null,"\t"));
                let recordArray = data.comments.map(comment => {
                    let retObj = { attributes: { type: 'MemorandumContentComment__c' },
                        ThreadId__c:currentThreadId, ExternalCommentId__c: comment.commentId, Content__c: comment.content,
                        Parent__c: recId
                    };
                    return retObj;
                });
                console.log('Record Array to save: %s',JSON.stringify(recordArray,null,"\t"));
                let compositeData = { allOrNone: true, records:recordArray };
                let compsiteUpsertUrl = `${this.baseUri}/services/data/v59.0/composite/sobjects/MemorandumContentComment__c/ExternalCommentId__c`;
                const retObj = { threadId: currentThreadId, comments: data.comments };
                try {
                    await axios.patch(compsiteUpsertUrl,compositeData,{
                        headers:{'authorization':` Bearer ${this.accessToken}`}
                    });
                    return Promise.resolve(retObj);
                } catch(e) {
                    return Promise.reject(e);
                }
            },
            async getCommentThread(data){
                let commentQuery = encodeURIComponent(`SELECT Id, ExternalCommentId__c, ThreadId__c, Content__c, ResolvedOn__c, ResolvedById__c, CreatedById, CreatedDate FROM MemorandumContentComment__c WHERE ThreadId__c ='${data.threadId}' ORDER BY CreatedDate ASC`);
                let commentQueryUrl = `${this.baseUri}/services/data/v59.0/query?q=${commentQuery}`;
                let response = await axios.get(commentQueryUrl,{
                    headers:{'authorization':`Bearer ${this.accessToken}`},
                    transformResponse: function(data){
                        //create the return object
                        let dataObj = JSON.parse(data);
                        const retObj = { threadId:'', attributes:{}};
                        retObj.comments = dataObj?.records.map((record) => {
                            retObj.threadId = record.ThreadId__c;
                            if(record?.ResolvedOn__c !== undefined && record?.ResolvedOn__c !== null){
                                retObj.resolvedAt = record.ResolvedOn__c;
                            }
                            if(record?.ResolvedById__c !== undefined && record?.ResolvedById__c !== null){
                                retObj.resolvedBy = record.ResolvedById__c;
                            }
                            return {commentId: record.ExternalCommentId__c, authorId: record.CreatedById, createdAt: record.CreatedDate, content: record.Content__c, attributes:{}};
                        });
                        return retObj;
                    }
                });
                return Promise.resolve(response.data);
            },
            updateCommentThread(data){
                //not really implemented because it only seems to be used for real-time collaboration, so I will just
                //return a void Promise.resolve statement.
                return Promise.resolve();
            },
            async resolveCommentThread(data){
                //first get all of the Comments that are related to the thread Id.
                let commentQuery = encodeURIComponent(`SELECT Id, ExternalCommentId__c, ThreadId__c, ResolvedById__c, ResolvedOn__c FROM MemorandumContentComment__c WHERE ThreadId__c = '${data.threadId}'`);
                let commentQueryUrl = `${this.baseUri}/services/data/v59.0/query?q=${commentQuery}`;
                try {
                    let commentQueryResponse = await axios.get(commentQueryUrl,{responseType:'json',headers:{'authorization':`Bearer ${this.accessToken}`}});
                    let recordArray = commentQueryResponse.data.records.map(record => {
                        record.ResolvedbyId__c = this.currentUser;
                        record.ResolvedOn__c = new Date();
                        return record;
                    });
                    let compsiteUpdateData = { allOrNone:true, records:recordArray};
                    let compositeUpdateUrl = `${this.baseUri}/services/data/v59.0/composite/sobjects/`;
                    await axios.patch(compositeUpdateUrl,compsiteUpdateData,{headers:{'authorization':`Bearer ${this.accessToken}`}});
                    let retObj = { threadId: data.threadId, resolvedAt: new Date(), resolvedBy: currentUserId };
                    return Promise.resolve(retObj);
                } catch(e) {
                    return Promise.reject(e);
                }
            },
            async reopenCommentThread(data){
                //first get all of the Comments that are related to the thread Id.
                let commentQuery = encodeURIComponent(`SELECT Id, ExternalCommentId__c, ThreadId__c, ResolvedById__c, ResolvedOn__c FROM MemorandumContentComment__c WHERE ThreadId__c = '${data.threadId}'`);
                let commentQueryUrl = `${this.baseUri}/services/data/v59.0/query?q=${commentQuery}`;
                try {
                    let commentQueryResponse = await axios.get(commentQueryUrl,{responseType:'json',headers:{'authorization':`Bearer ${this.accessToken}`}});
                    let recordArray = commentQueryResponse.data.records.map(record => {
                        record.ResolvedbyId__c = null;
                        record.ResolvedOn__c = null;
                        return record;
                    });
                    let compsiteUpdateData = { allOrNone:true, records:recordArray};
                    let compositeUpdateUrl = `${this.baseUri}/services/data/v59.0/composite/sobjects/`;
                    await axios.patch(compositeUpdateUrl,compsiteUpdateData,{headers:{'authorization':`Bearer ${this.accessToken}`}});
                    return Promise.resolve();
                } catch(e) {
                    return Promise.reject(e);
                }
            },
            async removeCommentThread(data){
                //first we need to get all of the MemorandumContentComment__c record Ids to remove
                let commentQuery = encodeURIComponent(`SELECT Id FROM MemorandumContentComment__c WHERE ThreadId__c = '${data.threadId}'`);
                let commentQueryUrl = `${this.baseUri}/services/data/v59.0/query?q=${commentQuery}`;
                try {
                    let commentQueryResponse = await axios.get(commentQueryUrl,{responseType:'json',headers:{'authorization':`Bearer ${this.accessToken}`}});
                    let recordIdArray = commentQueryResponse.data.records.map(record => record.Id);
                    let compositeDeleteUrl = `${this.baseUri}/services/data/v59.0/composite/sobjects?allOrNone=true&ids=${recordIdArray.join(',')}`;
                    await axios.delete(compositeDeleteUrl,{headers:{'authorization':`Bearer ${this.accessToken}`}});
                    return Promise.resolve();
                } catch(e) {
                    return Promise.reject(e);
                }
            }
        };
    }
}