<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    sections: {
        type: Array
    },
    contents: {
        type: Array
    }
});

const tocData = computed(()=>{
    let groupedContents = props.contents.reduce((prev,cur)=>{
        let curArray = (!Array.isArray(prev[cur.Parent__c])) ? [] : prev[cur.Parent__c];
        curArray.push(cur);
        prev[cur.Parent__c] = curArray;
        return prev;
    },{});
    let completeSections = props.sections.map(item => {
        item.expanded = (item.Id === expandedTocItem.value) ? true: false;
        item.selected = (item.Id === selectedTocItem.value) ? true : false;
        if(Object.hasOwn(groupedContents,item.Id)){
            item.children = groupedContents[item.Id];
            item.hasChildren = true;
        } else {
            item.hasChildren = false;
        }
        return item;
    });
    return completeSections;
});
const selectedTocItem = ref('');
const expandedTocItem = ref('');
</script>

<template>
    <div class="slds-box slds-theme_default">
        <div clas="slds-tree_container">
            <h4 class="slds-tree__group-header" id="treeheading">Table Of Contents</h4>
            <ul aria-labelledby="treeheading" clas="slds-tree" role="tree">
                <li v-for="tocItem in tocData" v-bind:key="tocItem.Id" aria-level="1" v-bind:aria-selected="tocItem.selected" v-bind:aria-expanded="tocItem.expanded" role="treeitem">
                    <div class="slds-tree__item">
                        <button v-bind:class="{'slds-button':true, 'slds-button_icon':true, 'slds-m-right_x-small':true, 'slds-hidden':!tocItem.hasChildren }" 
                            v-bind:aria-hidden="!tocItem.hasChildren" tabindex="-1" title="Expand Tree Branch" v-on:click="expandedTocItem = tocItem.Id">
                            <svg class="slds-button__icon slds-button__icon_small" v-bind:aria-hidden="!tocItem.hasChildren">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                            </svg>
                        </button>
                        <span class="slds-has-flexi-truncate">
                            <span class="slds-tree__item-label slds-truncate" v-bind:title="tocItem.Name">{{  tocItem.Name }}</span>    
                        </span>
                    </div>
                    <ul v-if="tocItem.hasChildren" role="group">
                        <li v-for="tocChildItem in tocItem.children" v-bind:key="tocChildItem.Id" aria-level="2" role="treeitem">
                            <div class="slds-tree__item">
                                <button class="slds-button slds-button_icon slds-m-right_x-small slds-hidden" aria-hidden="true" tabindex="-1" title="Expand Tree Branch">
                                    <svg class="slds-button__icon slds-button__icon_small" aria-hidden="true">
                                        <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                                    </svg>
                                    <span class="slds-assistive-text">Expand Tree Item</span>
                                </button>
                                <span class="slds-has-flexi-truncate">
                                    <span class="slds-tree__item-label slds-truncate" v-bind:title="tocChildItem.Name">{{ tocChildItem.Name }}</span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>
