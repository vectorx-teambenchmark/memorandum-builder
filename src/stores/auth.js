import { reactive, computed, inject } from 'vue';
import { defineStore } from 'pinia';

const useAuthStore = defineStore('authStore',()=>{
    const $cookies = inject('$cookies');
    const authInfo = reactive(rehydrateAuthInfo());
    const bearerToken = computed(()=>{
        return authInfo.bearerToken;
    });
    const authUrl = computed(()=>{
        return authInfo.authUrl;
    });
    const apiUrl = computed(()=>{
        return authInfo.apiUrl;
    });
    const callbackUrl = computed(()=>{
        return authInfo.callbackUrl;
    });
    const clientId = computed(()=>{
        return authInfo.clientId;
    });
    const idUrl = computed(()=>{
        return authInfo.idUrl;
    })
    const responseType = computed(()=>{
        return authInfo.responseType;
    });
    const displayType = computed(()=>{
        return authInfo.displayType;
    });
    const isAuthenticated = computed(()=>{
        return authInfo.bearerToken !== null && authInfo.bearerToken.length > 0;
    });
    function setToken(bToken){
        authInfo.bearerToken = bToken;
        storeSession();
    }
    function setApiUrl(aUrl){
        authInfo.apiUrl = aUrl;
        storeSession();
    }
    function setIdUrl(iUrl){
        authInfo.idUrl = iUrl;
        storeSession();
    }

    /**
     * method is designed to get Authorization information from Session Storage.  If nothing is in the session storage,
     * it will return a default auth object with the bearerToken and apiUrl empty.
     */
    function rehydrateAuthInfo(){
        let authObj = {
            bearerToken: '',
            apiUrl:'',
            authUrl:import.meta.env.VITE_SALESFORCE_AUTH_URL,
            callbackUrl: import.meta.env.VITE_CALLBACK_URL,
            clientId:'3MVG9eQyYZ1h89HeOdsdV9Y5dMYialY5mOZhtsRUdcePzvRoE21Je2NA9gr8f5XP31YtBvAuhcFgpVGEXX8CY',
            idUrl:'',
            responseType:'token',
            displayType:'page'
        };
        if($cookies.isKey('authStore')){
            authObj = $cookies.get('authStore');
        }
        return authObj;
    }
    /**
     * method is designed to store authorization information into Session Storage
     */
    function storeSession(){
        let { bearerToken, apiUrl, authUrl, callbackUrl, clientId, clientSecret, idUrl, responseType, displayPage } = authInfo;
        $cookies.set('authStore',JSON.stringify({
            bearerToken, apiUrl, authUrl, callbackUrl, clientId, clientSecret, idUrl, responseType, displayPage
        }),'');
    }
    function $reset(){
        $cookies.remove('authStore');
        authInfo.bearerToken = '';
        authInfo.apiUrl = '';
        authInfo.idUrl = '';
    }

    return { bearerToken, authUrl, apiUrl, callbackUrl, clientId, idUrl, responseType, displayType, isAuthenticated, setToken, setApiUrl, setIdUrl, $reset };
});

export default useAuthStore;