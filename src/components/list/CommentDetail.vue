<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { DateTime } from 'luxon';

const props = defineProps({
    comment: {
        type: Object,
        required: true,
        default(){
            return {};
        }
    }
});

/**
 * Computed properties
 */
const commentDate = computed(() => {
    let dt = DateTime.fromISO(props.comment.CreatedDate);
    return dt.toLocaleString();
});
const commentText = computed(()=> {
    return props.comment.Text__c;
});

/**
 * Internal Component Properties
 */
const showComment = ref(false);


onBeforeMount(() => {
    console.dir(props.comment);
});
</script>

<template>
    <div class="slds-timeline__item_expandable slds-timeline__item_task slds-is-open">
        <span class="slds-assistive-text">task</span>
        <div class="slds-media">
            <div class="slds-media__figure">
                <button class="slds-button slds-button_icon"
                    title="Toggle details for Review proposals for EBC deck with larger team and have marketing review this"
                    aria-controls="task-item-expanded-65" v-bind:aria-expanded="showComment" v-on:click="showComment = !showComment">
                    <svg v-if="!showComment" class="slds-button__icon slds-timeline__details-action-icon" aria-hidden="true">
                        <use xlink:href="@/assets/icons/utility-sprite/svg/symbols.svg#switch"></use>
                    </svg>
                    <svg v-if="showComment" class="slds-button__icon slds-timeline__details-action-icon" aria-hidden="true">
                        <use xlink:href="@/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                    </svg>
                    <span class="slds-assistive-text">Toggle details</span>
                </button>
                <div class="slds-icon_container slds-icon-standard-task slds-timeline__icon" title="task">
                    <svg class="slds-icon slds-icon_small" aria-hidden="true">
                        <use xlink:href="@/assets/icons/standard-sprite/svg/symbols.svg#task"></use>
                    </svg>
                </div>
            </div>
            <div class="slds-media__body">
                <div class="slds-grid slds-grid_align-spread slds-timeline__trigger">
                    <div
                        class="slds-grid slds-grid_vertical-align-center slds-truncate_container_75 slds-no-space">
                        
                        <h3 class="slds-truncate"
                            title="Review proposals for EBC deck with larger team and have marketing review this">
                            <a href="#">
                                <strong>External Comment</strong>
                            </a>
                        </h3>
                    </div>
                    <div class="slds-timeline__actions slds-timeline__actions_inline">
                        <p class="slds-timeline__date">{{ commentDate }}</p>
                    </div>
                </div>
                
                <article v-if="!showComment"
                    class="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium"
                    id="task-item-expanded-65">
                    
                    <div>
                        <span class="slds-text-title">Detail</span>
                        <p class="slds-p-top_x-small">{{ commentText }}</p>
                    </div>
                </article>
            </div>
        </div>
    </div>
</template>