import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';    



const useProcessStatusStore = defineStore('processStatusStore',() => {
    const Status = Object.freeze({ 
        WORKING: 'working',
        READY: 'ready'
    });
    const processInfo = reactive({
        contentEditor: Status.READY
    })
    const contentEditorStatus = computed(()=>{
        return processInfo.contentEditor;
    });
    const isContentEditorBusy = computed(()=>{
        return processInfo.contentEditor === Status.WORKING;
    });
    const isContentEditorReady = computed(()=>{
        return processInfo.contentEditor === Status.READY;
    });
    function setContentEditorBusy(){
        processInfo.contentEditor = Status.WORKING;
    }
    function setContentEditorReady(){
        processInfo.contentEditor = Status.READY;
    }
    return { Status, contentEditorStatus, isContentEditorBusy, isContentEditorReady, setContentEditorBusy, setContentEditorReady };
});
export default useProcessStatusStore;