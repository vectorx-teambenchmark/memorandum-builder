import { reactive } from 'vue';
import { defineStore } from 'pinia';

const useMemorandumVersionStore = defineStore('memorandumVersionStore',() => {
    const version = reactive({});

    function setVersionInfo(versionObj){
        //loop through the object passed in and set the properties of the internal version object.
        for(const key in versionObj){
            if(Object.hasOwn(versionObj,key)){
                version[key] = versionObj[key];
            }
        }
    }

    return { version, setVersionInfo };
});

export default useMemorandumVersionStore;