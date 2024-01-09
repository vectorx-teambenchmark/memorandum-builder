<script setup>
import { computed, ref, onBeforeMount, watch } from 'vue';

const props = defineProps({
    sections: {
        type: Array,
        default: ()=>{
            return [];
        }
    },
    contents: {
        type: Array,
        default: ()=>{
            return [];
        }
    }
});
const emit = defineEmits(['selection']);
const sections = computed(()=>{
    return props.sections;
});
const contents = computed(()=>{
    return props.contents;
});

const tocData = ref([]);
const selectedTocItem = ref('');
const expandedTocItem = ref('');

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
        completeSections = sections.value.map(item => {
            item.expanded = (item.Id === expandedTocItem.value) ? true: false;
            item.selected = (item.Id === selectedTocItem.value) ? true : false;
            if(Object.hasOwn(groupedContents,item.Id)){
                item.children = groupedContents[item.Id].map( item =>{
                    let copiedItem = Object.assign({},item);
                    copiedItem.selected = (item.Id === selectedTocItem.value) ? true:false;
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

watch([sections,contents,expandedTocItem],()=>{
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
                            v-on:click.self.stop="expandedTocItem = tocItem.Id">
                            <svg class="slds-button__icon slds-button__icon_small" v-bind:aria-hidden="!tocItem.hasChildren">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                            </svg>
                        </button>
                        <span class="slds-has-flexi-truncate">
                            <span class="slds-tree__item-label slds-truncate" v-bind:title="tocItem.Name"  
                                v-on:click.self.stop="emit('selection',tocItem.Id)">{{ tocItem.Name }}</span>    
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
                                        v-on:click.self.stop="emit('selection',tocChildItem.Id)">{{ tocChildItem.Name }} ({{ tocChildItem.ActiveComments__c }})</span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>
