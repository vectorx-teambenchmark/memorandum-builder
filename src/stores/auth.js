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

    /**
     * method is designed to get Authorization information from Session Storage.  If nothing is in the session storage,
     * it will return a default auth object with the bearerToken and apiUrl empty.
     */
    function rehydrateAuthInfo(){
        window.console.log('All Environment Variables: %s',JSON.stringify(import.meta.env,null,"\t"));
        let authObj = {
            bearerToken: '',
            apiUrl:'',
            authUrl:import.meta.env.VITE_SALESFORCE_AUTH_URL,
            callbackUrl: import.meta.env.VITE_CALLBACK_URL,
            clientId:'3MVG9eQyYZ1h89HeOdsdV9Y5dMYialY5mOZhtsRUdcePzvRoE21Je2NA9gr8f5XP31YtBvAuhcFgpVGEXX8CY',
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
        let { bearerToken, apiUrl, authUrl, callbackUrl, clientId, clientSecret, responseType, displayPage } = authInfo;
        /*
        sessionStorage.setItem('authStore',JSON.stringify({
            bearerToken, apiUrl, authUrl, callbackUrl, clientId, clientSecret, responseType, displayPage
        }));
        */
       $cookies.set('authStore',JSON.stringify({
            bearerToken, apiUrl, authUrl, callbackUrl, clientId, clientSecret, responseType, displayPage
       }),'');
    }
    function $reset(){
        $cookies.remove('authStore');
        authInfo.bearerToken = '';
        authInfo.apiUrl = '';
    }

    return { bearerToken, authUrl, apiUrl, callbackUrl, clientId, responseType, displayType, isAuthenticated, setToken, setApiUrl, $reset };
});

export default useAuthStore;