<script setup>
import axios from 'axios';
import { ref, onBeforeMount, computed } from 'vue';
import CKEditor from '@ckeditor/ckeditor5-vue';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
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

const props = defineProps({
   recordId: {
    type: String,
    required: true
   },
   apiUrl: {
    type: String,
    required: true
   },
   accessToken: {
    type: String,
    required: true
   },
   contentTitle: {
    type: String,
    required: true
   },
   bodyContent: {
    type: String,
    required: true
   } 
});
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
const recordApiUrl = `${props.apiUrl}/services/data/v58.0/sobjects/memorandumcontent__c/${props.recordId}`;
const ckeditor = CKEditor.component;
const editor = ClassicEditor
const editorConfig = {
    plugins: [
        Alignment,
        BlockQuote,
        Bold,
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
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'linkImage'
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
    simpleUpload: {
        uploadUrl: 'https://us-central1-cloud-functions-test-397013.cloudfunctions.net/image-host'
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
        'specialCharacters','undo','redo','findAndReplace'
    ],
    licenseKey: 'MktzKzlWWDEvSTdoOXV6TkhtY0RVVm0wMWlldTNtYzNPR2Y1dEVmWlJSaW9yQmhrcWRZQlJrb1RTUnl0LU1qQXlNekV4TWpFPQ==',
};
const editorData = ref('');
const contentName = ref('');
const modalText  = ref('Saving...');
const showModal = ref(false);

function handleSave(){
    showModal.value = true;
    axios.patch(recordApiUrl,{'Body__c':editorData.value},{
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
function closeModal(){
    showModal.value = false;
}
function closeWindow(){
    window.close();
}
function issueDebug(){
    console.log(editorData.value);
}

/**
 * lifecycle methods for VueJS components
 */
onBeforeMount(()=>{
    let {recordId, apiUrl, accessToken, contentTitle, bodyContent} = props;
    editorData.value = bodyContent;
    contentName.value = contentTitle;
})
</script>

<template>
    <div v-bind:class="{ 'modal': true, 'is-active': showModal }">
        <div class="modal-background" v-on:click="closeModal"></div>
        <div class="modal-content">
            <div class="card">
                <div class="card-container">
                    <div class="m-6 p-6 has-text-centered">
                        <span class="is-size-2 has-text-weight-bold">{{ modalText }}</span>
                    </div>
                </div>
            </div>
        </div>  
    </div>
    <nav class="navbar">
        <div class="navbar-item">
            <h2 class="is-size-1 editor-title">{{  contentName  }}</h2>
        </div>
        <div class="navbar-end">
            <button class="navbar-item button is-info is-medium mr-3" v-on:click="handleSave">Save</button>
            <button class="navbar-item button is-medium is-danger" v-on:click="closeWindow">Close</button>
            <button class="navbar-item button is-medium is-warning" v-on:click="issueDebug">Debug</button>
        </div>
    </nav>
    <ckeditor :editor="editor" v-model="editorData" :config="editorConfig" />
</template>

<style>
    h2.editor-title{
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