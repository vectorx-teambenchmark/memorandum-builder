<script setup>
import { computed, ref, onBeforeMount, watch } from 'vue';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import useProcessStatusStore from '../stores/processStatus';

const props = defineProps({
    sections: {
        type: Array,
        default(){
            return [];
        }
    },
    contents: {
        type: Array,
        default(){
            return [];
        }
    },
    versionId: {
        type: String,
        default(){
            return '';
        }
    },
    inApproval: {
        type: String,
        default(){
            return false;
        }
    }
});
const emit = defineEmits(['selection','sectionadded']);
const authStore = useAuthStore();
const processStatusStore = useProcessStatusStore();
const sections = computed(()=>{
    return props.sections;
});
const contents = computed(()=>{
    return props.contents;
});

const tocData = ref([]);
const selectedTocItem = ref('');
const expandedTocItem = ref('');
const expandedTocArray = ref([]);
const showNewSectionForm = ref(false);
const newSectionName = ref('');

function generateTocData(){
    let groupedContents = {};
    if(Array.isArray(contents.value)){
        groupedContents = contents.value.reduce((prev,cur)=>{
            let curArray = (!Array.isArray(prev[cur.Parent__c])) ? [] : prev[cur.Parent__c];
            curArray.push(cur);
            prev[cur.Parent__c] = curArray;
            return prev;
        },{});
    }
    let completeSections = [];
    if(Array.isArray(sections.value)){
        //console.log(`Sections Value: ${JSON.stringify(sections.value,null,"\t")}`);
        completeSections = sections.value.map(item => {
            item.expanded = (expandedTocArray.value.includes(item.Id)) ? true: false;
            item.selected = (item.Id === selectedTocItem.value) ? true : false;
            if(Object.hasOwn(groupedContents,item.Id)){
                item.children = groupedContents[item.Id].map( item =>{
                    let copiedItem = Object.assign({},item);
                    copiedItem.selected = (item.Id === selectedTocItem.value) ? true:false;
                    let activeComments = isNaN(item.ActiveComments__c) ? 0 : item.ActiveComments__c;
                    let externalComments = isNaN(item.ExternalComments__c) ? 0 : item.ExternalComments__c;
                    copiedItem.commentCount = activeComments + externalComments;    
                    return copiedItem;
                });
                item.hasChildren = true;
            } else {
                item.hasChildren = false;
            }
            return item;
        });
    }
    tocData.value = completeSections;
}
function handleExpandToggle(evt){
    let targetId = evt.target.dataset.id;
    let targetExpanded = evt.target.dataset.expanded === 'true';
    let newExpandedArray = [];
    if(targetExpanded === true){
        newExpandedArray = expandedTocArray.value.filter(item => item !== targetId);
    } else {
        newExpandedArray = [...expandedTocArray.value,targetId];
    }
    expandedTocArray.value = newExpandedArray;

}

async function handleSectionCreate(){
    let maxValue = 0;
    if(Array.isArray(sections.value) && sections.value.length > 0){
        let orderArray = sections.value.map(section => section.Order__c);
        maxValue = Math.max(...orderArray);
    }
    maxValue++;
    const newSectionData = { 'Name':newSectionName.value, 'Parent__c':props.versionId, 'Order__c':maxValue }
    try {
        let newSectionUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumSection__c/`;
        await axios.post(newSectionUrl,newSectionData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        showNewSectionForm.value = false;
        newSectionName.value = '';
        emit('sectionadded');
    } catch(e) {
        console.log('There was an error.');
        console.dir(e);
    }
}

function postNavEvent(selectionId){
    //first check if the event is able to be emitted
    if(processStatusStore.isContentEditorBusy){
        window.alert('The Content Editor is currently busy saving changes. Please wait a moment and try again.');
        return;
    }
    emit('selection',selectionId);
}

watch([sections,contents,expandedTocItem,expandedTocArray],()=>{
    generateTocData();
});
onBeforeMount(()=>{
    generateTocData();
});
</script>

<template>
    <div class="slds-box slds-theme_default">
        <div clas="slds-tree_container">
            <h4 class="slds-tree__group-header" id="treeheading">Table Of Contents</h4>
            <ul aria-labelledby="treeheading" clas="slds-tree" role="tree">
                <li v-for="tocItem in tocData" v-bind:key="tocItem.Id" aria-level="1" v-bind:aria-selected="tocItem.selected" 
                    v-bind:aria-expanded="tocItem.expanded" role="treeitem">
                    <div class="slds-tree__item">
                        <button v-bind:class="{'slds-button':true, 'slds-button_icon':true, 'slds-m-right_x-small':true, 'slds-hidden':!tocItem.hasChildren }" 
                            v-bind:aria-hidden="!tocItem.hasChildren" tabindex="-1" title="Expand Tree Branch" 
                            v-on:click.self.stop="handleExpandToggle" v-bind:data-id="tocItem.Id" v-bind:data-expanded="tocItem.expanded">
                            <svg class="slds-button__icon slds-button__icon_small" v-bind:aria-hidden="!tocItem.hasChildren">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                            </svg>
                        </button>
                        <span class="slds-has-flexi-truncate">
                            <span class="slds-tree__item-label slds-truncate" v-bind:title="tocItem.Name"  
                                v-on:click.self.stop="postNavEvent(tocItem.Id)">{{ tocItem.Name }}</span>    
                        </span>
                    </div>
                    <ul v-if="tocItem.hasChildren" v-bind:class="{'slds-hide':!tocItem.expanded,'slds-show':tocItem.expanded}" 
                        role="group">
                        <li v-for="tocChildItem in tocItem.children" v-bind:key="tocChildItem.Id" aria-level="2" 
                            v-bind:aria-selected="tocChildItem.selected"
                            role="treeitem">
                            <div class="slds-tree__item">
                                <button class="slds-button slds-button_icon slds-m-right_x-small slds-hidden" aria-hidden="true" 
                                    tabindex="-1" title="Expand Tree Branch">
                                    <svg class="slds-button__icon slds-button__icon_small" aria-hidden="true">
                                        <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                                    </svg>
                                    <span class="slds-assistive-text">Expand Tree Item</span>
                                </button>
                                <span class="slds-has-flexi-truncate">
                                    <span class="slds-tree__item-label slds-truncate" v-bind:title="tocChildItem.Name"
                                        v-on:click.self.stop="postNavEvent(tocChildItem.Id)">{{ tocChildItem.Name }} ({{ tocChildItem.ExternalComments__c }}) <span class="slds-text-color_error">({{  tocChildItem.ActiveComments__c }})</span> <span class="slds-text-color_success">({{  tocChildItem.ResolvedComments__c }})</span> </span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <button v-if="!inApproval" v-bind:class="{'slds-button':true, 'slds-button_brand':!showNewSectionForm, 'slds-button_destructive':showNewSectionForm, 'slds-var-m-top_x-large':true }" v-on:click="showNewSectionForm = !showNewSectionForm">{{ (!showNewSectionForm) ? 'Add New Section':'Cancel New Section' }}</button>
        <div v-if="showNewSectionForm" class="slds-grid slds-wrap">
            <div class="slds-col slds-size_1-of-1">
                <div class="slds-form-element">
                    <label class="slds-form-element__label" for="txtNewSectionName">Section Name</label>
                    <div class="slds-form-element__control">
                        <input type="text" class="slds-input" id="txtNewSectionName" v-model="newSectionName" placeholder="Enter New Section Name..."/>
                    </div>
                </div>
            </div>
            <div class="slds-col slds-size_1-of-1 slds-var-p-top_small">
                <button class="slds-button slds-button_brand" v-on:click="handleSectionCreate">Save</button>
            </div>
        </div>
    </div>
</template>
