import { reactive, computed, inject } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

const useAuthStore = defineStore('authStore',()=>{
    const $cookies = inject('$cookies');
    const authInfo = reactive(rehydrateAuthInfo());
    const bearerToken = computed(()=>{
        return authInfo.bearerToken;
    });
    const authUrl = computed(()=>{
        return authInfo.authUrl;
    });
    /**
     * Derive the token endpoint URL from the authorization URL.
     * The authorization URL is typically:
     *   https://login.salesforce.com/services/oauth2/authorize
     * The token endpoint is:
     *   https://login.salesforce.com/services/oauth2/token
     *
     * In development mode, use the Vite proxy endpoint (/oauth2/token)
     * to avoid CORS issues. In production, POST directly to the
     * Salesforce token endpoint (requires CORS allowlist in Salesforce).
     */
    const tokenUrl = computed(()=>{
        if(import.meta.env.DEV){
            return '/oauth2/token';
        }
        return authInfo.authUrl.replace('/authorize', '/token');
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
     * Generates a cryptographically random string for use as a PKCE code verifier.
     * The verifier must be between 43 and 128 characters of unreserved characters.
     * @param {number} length - Length of the verifier (default 64, within 43-128 range)
     * @returns {string} A random string suitable as a PKCE code verifier
     */
    function generatePKCEVerifier(length = 64){
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => charset[byte % charset.length]).join('');
    }

    /**
     * Computes the PKCE code challenge from a code verifier.
     * Uses SHA-256 and base64url encoding as per RFC 7636.
     * @param {string} verifier - The code verifier string
     * @returns {Promise<string>} The base64url-encoded SHA-256 hash
     */
    async function generateCodeChallenge(verifier){
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    /**
     * Generates all PKCE values needed for an authorization request.
     * Stores the code verifier in sessionStorage for retrieval during the callback.
     * Also generates a random state value for CSRF protection.
     * @param {string} [recordId] - Optional record ID to include in the state parameter
     * @returns {Promise<{codeChallenge: string, state: string}>}
     */
    async function generatePKCEValues(recordId){
        const codeVerifier = generatePKCEVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateRandomState();

        // Store the code verifier and state for retrieval during the callback
        sessionStorage.setItem('pkce_code_verifier', codeVerifier);
        sessionStorage.setItem('pkce_state', state);
        if(recordId){
            sessionStorage.setItem('pkce_record_id', recordId);
        }

        return { codeChallenge, state };
    }

    /**
     * Generates a random string for use as the OAuth state parameter (CSRF protection).
     * @returns {string} A random alphanumeric string
     */
    function generateRandomState(){
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Exchanges an authorization code for tokens by POSTing to the Salesforce token endpoint.
     * Uses PKCE so no client secret is required (public client flow).
     * @param {string} code - The authorization code received from the callback
     * @returns {Promise<{access_token: string, instance_url: string, id: string, ...}>}
     * @throws {Error} If the code verifier is missing or the token exchange fails
     */
    async function exchangeCodeForToken(code){
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        if(!codeVerifier){
            throw new Error('PKCE code verifier not found in session. The authorization request may have expired or been tampered with.');
        }

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: authInfo.clientId,
            redirect_uri: authInfo.callbackUrl,
            code_verifier: codeVerifier
        });

        try {
            const response = await axios.post(tokenUrl.value, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } finally {
            // Clean up PKCE session values regardless of success or failure
            sessionStorage.removeItem('pkce_code_verifier');
            sessionStorage.removeItem('pkce_state');
            //sessionStorage.removeItem('pkce_record_id'); //prematurely removed before it could be used for redirection to correct place after authentication.
        }
    }

    /**
     * Verifies that the state returned from the OAuth callback matches what was sent.
     * This protects against CSRF attacks on the redirect flow.
     * @param {string} returnedState - The state value from the OAuth callback
     * @returns {boolean} True if the state is valid
     */
    function verifyState(returnedState){
        const storedState = sessionStorage.getItem('pkce_state');
        if(!storedState || storedState !== returnedState){
            return false;
        }
        return true;
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
            clientId:'3MVG9SnjeJhUwbWF8wIwmBG.v_fbQgHMmvdgLx6LyBpc2Of9lMRtZ89TxbVOSMwdOvU.VuchgLKQcMVh1t_sR',
            idUrl:'',
            responseType:'code',
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
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');
        sessionStorage.removeItem('pkce_record_id');
        authInfo.bearerToken = '';
        authInfo.apiUrl = '';
        authInfo.idUrl = '';
    }

    return { bearerToken, authUrl, tokenUrl, apiUrl, callbackUrl, clientId, idUrl, responseType, displayType, isAuthenticated, setToken, setApiUrl, setIdUrl, generatePKCEValues, exchangeCodeForToken, verifyState, $reset };
});

export default useAuthStore;
