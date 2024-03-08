<script setup>
import { computed } from 'vue';
import CommentDetail from './CommentDetail.vue';

/**exposed (external properties) */
const props = defineProps({
    comments: {
        type: Array,
        required: true,
        default(){
            return [];
        }
    }
});

/**
 * Computed Properties
 **/
const commentArray = computed(()=>{
    return props.comments;
});

</script>

<template>
<ul class="slds-timeline">
    <li v-for="comment in commentArray" v-bind:key="comment.Id">
        <CommentDetail v-bind:comment="comment"></CommentDetail>
    </li>
</ul>
</template>