<script setup>
import { computed, onBeforeMount, ref } from 'vue';

const props = defineProps(['sections','contents']);

const tocData = ref([]);
const selectedTocItem = computed(()=>{
    return false;
})

onBeforeMount(() => {
    let groupedContents = props.contents.reduce((prev,cur)=>{
        let curArray = (!Array.isArray(prev[cur.Parent__c])) ? [] : prev[cur.Parent__c];
        curArray.push(cur);
        prev[cur.Parent__c] = curArray;
        return prev;
    },{});
    let completeSections = props.sections.map(item => {
        let tempItem = Object.assign({},item);
        if(Object.hasOwn(groupedContents,item.Id)){
            tempItem.children = groupedContents[item.Id];
        }
        return tempItem;
    });
    tocData.value = completeSections;
});
</script>

<template>
    <div class="slds-box slds-theme_default">
        <div clas="slds-tree_container">
            <h4 class="slds-tree__group-header" id="treeheading">Table Of Contents</h4>
            <ul aria-labelledby="treeheading" clas="slds-tree" role="tree">
                <li v-if="tocItem in tocData" v-bind:key="tocItem.Id" aria-level="1" v-bind:aria-selected="selectedTocItem" role="treeitem">
                    <div class="slds-tree__item">
                        <button class="slds-button slds-button_icon slds-m-right_x-small slds-hidden"></button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
