<script setup>
import axios from 'axios';
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import CKEditor from '@ckeditor/ckeditor5-vue';
import { Autosave } from '@ckeditor/ckeditor5-autosave';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Comments } from '@ckeditor/ckeditor5-comments';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Bold, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FormatPainter } from '@ckeditor/ckeditor5-format-painter';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { DocumentList, DocumentListProperties } from '@ckeditor/ckeditor5-list';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { MediaEmbed, MediaEmbedToolbar } from '@ckeditor/ckeditor5-media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { PasteFromOfficeEnhanced } from '@ckeditor/ckeditor5-paste-from-office-enhanced';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { SelectAll } from '@ckeditor/ckeditor5-select-all';
import { SlashCommand } from '@ckeditor/ckeditor5-slash-command';
import { SpecialCharacters, SpecialCharactersArrows, SpecialCharactersCurrency, SpecialCharactersEssentials, 
         SpecialCharactersLatin, SpecialCharactersMathematical, SpecialCharactersText } from '@ckeditor/ckeditor5-special-characters';
import { Style } from '@ckeditor/ckeditor5-style';
import { Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import { Template } from '@ckeditor/ckeditor5-template';
import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
import { CommentsAdapter } from '../utils/ckeditor-adapter/CommentsAdapter';
import useAuthStore from '../stores/auth';

const props = defineProps({
   recordId: {
    type: String,
    required: true,
    default(){
        return '';
    }
   },
   apiUrl: {
    type: String,
    required: true,
    default(){
        return '';
    }
   },
   accessToken: {
    type: String,
    required: true,
    default(){
        return '';
    }
   },
   idUrl: {
    type: String,
    required: true,
    default(){
        return '';
    }
   },
   contentTitle: {
    type: String,
    required: true,
    default(){
        return 'N/A';
    }
   },
   bodyContent: {
    type: String,
    required: true,
    default(){
        return '';
    }
   },
   approvalRequestSubmitted: {
    type: Boolean,
    default(){
        return false;
    }
   },
   isPublished: {
    type: Boolean,
    default(){
        return false;
    }
   } 
});
const emit = defineEmits(['contentupdated']);
const authStore = useAuthStore();
const router = useRouter();
const colorArray = computed(()=>{
    return [
            {
                color: 'hsl(0,0%,65%)',
                name: 'Medium Grey'
            },
            {
                color: 'hsl(214,73%,58%)',
                name: 'Blue 1'
            },
            {
                color: 'hsl(205,32%,39%)',
                name: 'Slate Blue'
            },
            {
                color: 'hsl(0,0%,100%)',
                name: 'White'
            },
            {
                color: 'hsl(0,0%,84%)',
                name: 'off-white'
            },
            {
                color: 'hsl(199,66%,56%)',
                name: 'Blue 2'
            },
            {
                color: 'hsl(209,34%,51%)',
                name: 'Slate Blue Light'
            },
            {
                color: 'hsl(29,28%,55%)',
                name: 'Brown'
            },
            {
                color: 'hsl(19,36%,45%)',
                name: 'Bronze'
            },
            {
                color: 'hsl(207,25%,23%)',
                name: 'Slate Blue Dark'
            },
            {
                color: 'hsl(0,0%,17%)',
                name: 'Dark Grey'
            },
            {
                color: 'hsl(36,49%,64%)',
                name: 'Light Brown'
            },
            {
                color: 'hsl(20,40%,51%)',
                name: 'High Bronze'
            },
            {
                color: 'hsl(213,21%,36%)',
                name: 'Slate Blue Medium'
            },
            {
                color: 'hsl(0,0,27)',
                name: 'Dark Grey'
            }
        ];
});
const contentRecord = ref({});
const recordApiUrl = computed(()=>{
    return `${props.apiUrl}/services/data/v58.0/sobjects/memorandumcontent__c/${props.recordId}`
});
const showOnlyComments = computed(()=>{
    return props.approvalRequestSubmitted || props.isPublished;
});
const ckeditor = CKEditor.component;
const editor = ClassicEditor
const editorConfig = {
    plugins: [
        Alignment,
        Autosave,
        BlockQuote,
        Bold,
        Comments,
        DocumentList,
        DocumentListProperties,
        Essentials,
        FindAndReplace,
        FontBackgroundColor, 
        FontColor, 
        FontFamily, 
        FontSize,
        FormatPainter,
        GeneralHtmlSupport,
        HorizontalLine,
        HtmlEmbed,
        Italic,
        Image, 
        ImageCaption, 
        ImageResize, 
        ImageStyle, 
        ImageToolbar, 
        ImageUpload,
        Indent,
        IndentBlock,
        Link,
        LinkImage,
        MediaEmbed, 
        MediaEmbedToolbar,
        Mention,
        Paragraph,
        PasteFromOffice,
        PasteFromOfficeEnhanced,
        RemoveFormat,
        SelectAll,
        SimpleUploadAdapter,
        SlashCommand,
        Strikethrough, 
        SpecialCharacters, 
        SpecialCharactersArrows, 
        SpecialCharactersCurrency, 
        SpecialCharactersEssentials, 
        SpecialCharactersLatin, 
        SpecialCharactersMathematical, 
        SpecialCharactersText,
        Style,
        Subscript, 
        Superscript,
        Table, 
        TableCaption, 
        TableCellProperties, 
        TableColumnResize, 
        TableProperties, 
        TableToolbar,
        Template,
        Underline,
        WordCount
    ],
    extraPlugins: [ CommentsAdapter ],
    autosave: {
        save( editor ) {
            handleAutoSave( editor.getData() );
        }
    },
    comments:{
        editorConfig: {
            extraPlugins: [Bold, Italic, DocumentList ]
        }
    },
    fontBackgroundColor: {
        colors:colorArray.value
    },
    fontColor: {
        colors:colorArray.value
    },
    fontFamily: {
        options:[
            'default',
            'Poppins',
            'Passenger Display Regular',
            'Passenger Display Bold',
            'Passenger Display Bold Italic',
            'Passenger Display Extra Bold',
            'Passenger Display Extra Bold Italic',
            'Passenger Display Extra Light',
            'Passenger Display Extra Light Italic'
        ]
    },
    fontSize:{
        options: [9,10,11,12,14,16,18,20,24,32,48,60]
    },
    image: {
        insert: {
            type:'block'
        },
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'linkImage',
            '|',
            {
                name:'imageStyle:icons',
                title:'Inline Alignment',
                items:['imageStyle:inline','imageStyle:alignLeft','imageStyle:alignRight'],
                defaultItem:'imageStyle:inline'
            },
            {
                name:'imageStyle:pictures',
                title:'Block Alignment',
                items:['imageStyle:block','imageStyle:alignBlockLeft','imageStyle:alignBlockRight'],
                defaultItem:'imageStyle:block'
            }
        ]
    },
    mediaEmbed: {
        previewsInData: true,
        toolbar:[
        {
                // Grouping the buttons for the icon-like image styling
                // into one drop-down.
                name: 'imageStyle:icons',
                title: 'Alignment',
                items: [
                    'imageStyle:margin-left',
                    'imageStyle:margin-right',
                    'imageStyle:inline'
                ],
                defaultItem: 'imageStyle:margin-left'
            }
        ]
    },
    salesforceApi: {
        baseUri: props.apiUrl,
        accessToken: props.accessToken,
        currentUserUri: props.idUrl
    },
    simpleUpload: {
        uploadUrl: `${import.meta.env.VITE_IMAGE_PROCESSOR}`
    },
    style: {
        definitions: [
            {
                name: 'Heading',
                element:'p',
                classes: ['heading']
            }
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableCellProperties',
            'tableProperties'
        ],
        tableProperties: {
            borderColors: colorArray.value,
            backgroundColors: colorArray.value
        },
        tableCellProperties: {
            borderColors: colorArray.value,
            backgroundColors: colorArray.value
        }
    },
    template: {
        definitions: [
            {
                title: '15 Row Table',
                description: 'A Table with 3 columns and 15 rows.',
                data: '<figure class="table"><table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure>'
            },
            {
                title: '20 Row Table',
                description: 'A Table with 3 columns and 20 rows.',
                data: '<figure class="table"><table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure>'
            },
            {
                title: 'Executive Summary',
                description: 'Two column layout for Executive Summary Information.',
                data:`<figure class="table" style="width:100%;"><table><tbody><tr><td style="vertical-align:top;width:50%;"><figure class="table" style="width:95%;"><table><tbody><tr><td style="padding:.5rem;vertical-align:top;"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">BUSINESS DESCRIPTION</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><p style="text-align:justify;">Bacon ipsum dolor amet pork chop tri-tip cupim meatloaf, pig drumstick tenderloin pork. Sirloin chicken strip steak, jowl salami short ribs pastrami t-bone capicola pork loin rump. Capicola doner cupim t-bone, shoulder venison porchetta spare ribs sirloin alcatra meatloaf andouille pig. Meatball swine landjaeger leberkas ribeye pastrami, ball tip jowl ham hock.</p></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">HEADQUARTERS</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;">Tampa, FL, United States</td></tr><tr><td style="padding:.5rem;vertical-align:top;"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">WEBSITE</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><a href="https://www.benchmarkinternational.com">https://www.benchmarkinternational.com</a></td></tr><tr><td><figure class="table" style="width:100.24%;"><table class="ck-table-resized" style="background-color:hsl(0,2%,90%);"><colgroup><col style="width:4.83%;"><col style="width:95.17%;"></colgroup><tbody><tr><td style="padding:.5rem;vertical-align:top;" colspan="2"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">KEY FEATURES</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;">&nbsp;</td><td style="padding:.5rem;vertical-align:top;"><ul><li>Flank salami burgdoggen shank drumstick.</li><li>Ball tip boudin cupim tongue pork chop salami rump ham.</li><li>Doner frankfurter landjaeger ball tip short loin.</li><li>Chuck porchetta meatloaf, frankfurter rump short loin strip steak bresaola swine doner t-bone.</li></ul></td></tr></tbody></table></figure></td></tr></tbody></table></figure></td><td style="vertical-align:top;width:50%;"><figure class="table" style="width:95%;"><table><tbody><tr><td style="padding:.5rem;vertical-align:top;"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">MARKETS SERVED</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><p style="text-align:justify;">Landjaeger picanha drumstick short loin, buffalo chuck pork chop salami capicola beef hamburger. Boudin shoulder meatball, flank pancetta biltong fatback beef ribs leberkas spare ribs ball tip. Salami picanha landjaeger meatball, chuck pork chop cupim sirloin.&nbsp;</p></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">REAL ESTATE</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><p style="text-align:justify;">Jowl venison short loin t-bone hamburger pork chop ball tip pastrami doner tenderloin cow sausage pork loin tail boudin. Sirloin filet mignon hamburger jerky pork chop chislic turducken beef ribs brisket kielbasa ham chuck pork belly burgdoggen. Turkey tail shank, swine filet mignon jowl biltong cow salami ball tip pork loin tri-tip ham shankle alcatra.</p></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">OWNERSHIP</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;"><p style="text-align:justify;">Landjaeger picanha drumstick short loin, buffalo chuck pork chop salami capicola beef hamburger. Boudin shoulder meatball, flank pancetta biltong fatback beef ribs leberkas spare ribs ball tip.</p></td></tr><tr><td><figure class="table" style="width:100.12%;"><table class="ck-table-resized" style="background-color:hsl(0,2%,90%);"><colgroup><col style="width:4.83%;"><col style="width:95.17%;"></colgroup><tbody><tr><td style="padding:.5rem;vertical-align:top;" colspan="2"><span style="color:hsl(252,31%,47%);font-family:Poppins;font-size:24px;">OPPORTUNITIES</span></td></tr><tr><td style="padding:.5rem;vertical-align:top;">&nbsp;</td><td style="padding:.5rem;vertical-align:top;"><ul><li><strong>Expansion: </strong>Expand operations geographically to reach new markets across the US and internationally</li><li><strong>AI: </strong>Continue developing an AI-driven content and marketing service for the existing client base</li><li><strong>Additional Services: </strong>Further pursue the high demand fractional marketing services</li><li><strong>New Partner Services: </strong>Develop HubSpot premium services to better serve the company’s current HubSpot clientele</li></ul></td></tr></tbody></table></figure></td></tr></tbody></table></figure><p>&nbsp;</p></td></tr></tbody></table></figure>`
            },
            {
                title:'Highlight Box',
                description: 'A table that serves as a highlight box.',
                data: '<figure class="table" style="width:13.73%;"><table class="ck-table-resized" style="border:.15rem solid hsl(207,25%,23%);"><colgroup><col style="width:13.93%;"><col style="width:86.07%;"></colgroup><thead><tr><th style="background-color:hsl(207,25%,23%);" colspan="2"><p style="text-align:center;"><span style="color:hsl(0,0%,100%);font-family:\'Passenger Display Bold\';font-size:24px;">Title</span></p></th></tr></thead><tbody><tr><td style="width:5%;">&nbsp;</td><td style="width:95%;"><ul><li><span style="font-family:Poppins;font-size:12px;">Turducken sed buffalo nulla, prosciutto boudin dolore fatback.</span></li><li><span style="font-family:Poppins;font-size:12px;">Bacon ipsum dolor amet irure ex flank t-bone, quis buffalo tail pariatur rump aliqua drumstick frankfurter corned beef non.</span></li><li><span style="font-family:Poppins;font-size:12px;">Duis anim dolor officia id.</span></li></ul></td></tr></tbody></table></figure>'
            },
            {
                title:'Two Column Layout - Evenly Distributed',
                description: 'A table that serves as a two column layout with each column being evenly distributed.',
                data: `<figure class="table" style="width:100%;"><table><tbody><tr><td style="vertical-align:top;width:50%;">&nbsp;</td><td style="vertical-align:top;width:50%;">&nbsp;</td></tr></tbody></table></figure>`
            },
            {
                title:'Two column Layout - 60/40',
                description: 'A table that serves as a two-column layout with the first column taking 60% of the size and the second column having 40% size.',
                data: `<figure class="table" style="width:100%;"><table><tbody><tr><td style="width:60%;">&nbsp;</td><td style="width:40%;">&nbsp;</td></tr></tbody></table></figure>`
            },
            {
                title:'Three column Layout - Evenly Distributed',
                description: 'A table that serves as a three column layout with each column being evenly distributed.',
                data: `<figure class="table" style="width:100%;"><table><tbody><tr><td style="vertical-align:top;width:33%;">&nbsp;</td><td style="vertical-align:top;width:33%;">&nbsp;</td><td style="vertical-align:top;width:33%;">&nbsp;</td></tr></tbody></table></figure>`
            }
        ]
    },
    toolbar: ['style',
        'alignment','bold','italic','underline','strikethrough','subscript','superscript','removeFormat','formatPainter','|',
        'fontBackgroundColor','fontColor','fontSize','fontFamily','|','link','bulletedList','numberedList','selectAll','|',
        'horizontalLine','outdent','indent','|','imageUpload','htmlEmbed','blockQuote','insertTable','mediaEmbed','insertTemplate',
        'specialCharacters','undo','redo','findAndReplace','|','comment','commentsArchive'
    ],
    licenseKey: 'cFJaWmgyNFNzeS9OZ2N3ZzdRd3lnS0w3YUVUaUJGcWZVL0lHdTRxaTQxNjVvai9rbW1kYUVTSVJnTlZQLU1qQXlNekV5TVRZPQ==',
};
const editorData = ref('');
const contentName = computed(()=>{
    return (contentRecord.value?.Name !== undefined) ? contentRecord.value.Name:'';
});
const modalText  = ref('Saving...');
const showModal = ref(false);
const displayRenameContentForm = ref(false);

function handleCalloutException(e) {
    switch(e.response.status) {
        case 401:
            authStore.$reset();
            router.push({name:'home'});
            break;
        default:
            console.log('There was an error: %s',JSON.stringify(e,null,"\t"));
    }
}
function handleSave(){
    showModal.value = true;
    axios.patch(recordApiUrl.value,{'Body__c':editorData.value},{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${props.accessToken}`
        }
    }).then(response =>{
        if(response.status < 300){
             modalText.value = 'Save Complete';
             setTimeout(closeModal,2000);
        }
    }).catch((err)=>{
        console.log('There was an error updating the record: %s',JSON.stringify(err,null,"\t"));
    });
}
function handleAutoSave( editorData ) {
    //build the data objects
    let dataObj = { Body__c: editorData };
    return axios.patch(recordApiUrl.value,dataObj, {
        headers: {'authorization':`Bearer ${props.accessToken}`,'content-type':'application/json'}
    });
}
function closeModal(){
    showModal.value = false;
}
function issueDebug(){
    console.log(editorData.value);
}
async function refreshContentRecord(recordIdVal){
    try {
        let contentEndpoint = `${props.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/memorandumcontent__c/${recordIdVal}`;
        let contentResponse = await axios.get(contentEndpoint,{
            responseType:'json',
            headers:{'authorization':`Bearer ${props.accessToken}`}
        });
        contentRecord.value = contentResponse.data;
        editorData.value = (contentRecord.value?.Body__c === undefined || contentRecord.value?.Body__c === null) ? '':contentRecord.value.Body__c;
    } catch(e) {
        console.log('Error getting content: %s',JSON.stringify(e,null,"\t"))
    }
}
async function handleSaveInformation(){
    try {
        let contentUpdateEndpoint =`${props.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumContent__c/${contentRecord.value.Id}`;
        let tempObject = Object.assign({},{Name:contentRecord.value.Name});
        await axios({
            method: 'patch',
            url: contentUpdateEndpoint,
            data: tempObject,
            headers: {'authorization':`Bearer ${props.accessToken}`}

        });
        displayRenameContentForm.value = false;
        emit('contentupdated');
        refreshContentRecord(contentRecord.value.Id);
    } catch(e) {
        handleCalloutException(e);
    }
}

/**
 * watchers
 */
watch(() => props.recordId, async (newValue)=>{
    refreshContentRecord(newValue);
});
onBeforeMount(()=>{
    refreshContentRecord(props.recordId);
});

</script>

<template>
    <!-- BEGIN : Modal-->
    <div v-if="showModal" role="dialog" tabindex="-1" class="slds-modal slds-fade-in-open">
        <div class="slds-modal__container">
            <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse">
                <svg class="slds-button__icon ala-button__icon_large" aria-hidden="true">
                    <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                </svg>
                <span class="slds-assistive-text">Cancel and close</span>
            </button>
            <div class="slds-modal__content slds-p-around_medium slds-modal__content_headless">
                <h2 class="slds-text-heading_large">{{ modalText }}</h2>
            </div>
            <div class="slds-modal__footer">
                <button class="slds-button slds-button_neutral" aria-label="Cancel and close">Close</button>
            </div>
        </div>  
    </div>
    <div v-if="showModal" role="presentation" class="slds-backdrop slds-backdrop_open"></div>
    <!-- END : Modal-->

    <!-- BEGIN : Header and Actions-->
    <nav class="slds-page-header">
        <div class="slds-page-header__row">
            <div class="slds-page-header__col-title">
                <div class="slds-media">
                    <div class="slds-media__figure">

                    </div>
                    <div class="slds-media__body">
                        <div class="slds-page-header__name">
                            <div class="slds-page-header__name-title">
                                <h1>
                                    <span class="slds-page-header__title slds-truncate" v-bind:title="contentName">{{ contentName }}</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="slds-page-header__col-actions">
                <div class="slds-page-header__controls">
                    <div class="slds-page-header__control">
                        <ul class="slds-button-group-list">
                            <li>
                                <button class="slds-button slds-button_neutral" v-bind:disabled="approvalRequestSubmitted || isPublished" v-on:click="displayRenameContentForm = !displayRenameContentForm">{{ (displayRenameContentForm) ? 'Cancel Rename Content':'Rename Content' }}</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_brand" v-bind:disabled="approvalRequestSubmitted || isPublished" v-on:click="handleSave">Save</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_text-destructive" v-on:click="issueDebug">Debug</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    <div v-if="displayRenameContentForm" class="slds-grid slds-wrap slds-box slds-theme_default">
        <div class="slds-col slds-size_1-of-1">
            <div class="slds-form-element">
                <label class="slds-form-element__label" for="txtContentName">Content Name</label>
                <div class="slds-form-element__control">
                    <input type="text" class="slds-input" id="txtContentName" v-model="contentRecord.Name" />
                </div>
            </div>
        </div>
        <div class="slds-col slds-size_1-of-1 slds-var-p-vertical_small">
            <div class="slds-button-group">
                <button class="slds-button slds-button_brand" v-on:click="handleSaveInformation">Save</button>
                <button class="slds-button slds-button_destructive" v-on:click="displayRenameContentForm = false">Cencel</button>
            </div>
        </div>
    </div>
    <!-- END : Header and Actions-->

    <ckeditor :editor="editor" v-model="editorData" :config="editorConfig" :disabled="showOnlyComments" />
</template>

<style>
    ul {
        padding-inline-start: 40px !important;
    }
    h2.editor-title {
        font-family: Poppins,sans-serif;
        font-weight: 700;
    }
    .ck.ck-content {
        padding: 1.2rem;
    }
    .heading {
        font-family: 'Passenger Display Extra Bold';
        font-size: 5rem;
        letter-spacing: .2rem;
    }
</style>