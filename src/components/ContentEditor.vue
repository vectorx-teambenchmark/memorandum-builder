<script setup>
import axios from 'axios';
import { ref, onBeforeMount } from 'vue';
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
   } 
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
        colors:[
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
        ]
    },
    fontColor: {
        colors:[
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
        ]
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
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
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
        ]
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
                title:'Highlight Box',
                description: 'A table that serves as a highlight box.',
                data: '<figure class="table" style="width:13.73%;"><table class="ck-table-resized" style="border:.15rem solid hsl(207,25%,23%);"><colgroup><col style="width:13.93%;"><col style="width:86.07%;"></colgroup><thead><tr><th style="background-color:hsl(207,25%,23%);" colspan="2"><p style="text-align:center;"><span style="color:hsl(0,0%,100%);font-family:\'Passenger Display Bold\';font-size:24px;">Title</span></p></th></tr></thead><tbody><tr><td style="width:5%;">&nbsp;</td><td style="width:95%;"><ul><li><span style="font-family:Poppins;font-size:12px;">Turducken sed buffalo nulla, prosciutto boudin dolore fatback.</span></li><li><span style="font-family:Poppins;font-size:12px;">Bacon ipsum dolor amet irure ex flank t-bone, quis buffalo tail pariatur rump aliqua drumstick frankfurter corned beef non.</span></li><li><span style="font-family:Poppins;font-size:12px;">Duis anim dolor officia id.</span></li></ul></td></tr></tbody></table></figure>'
            }
        ]
    },
    toolbar: ['style',
        'alignment','bold','italic','underline','strikethrough','subscript','superscript','removeFormat','formatPainter','|',
        'fontBackgroundColor','fontColor','fontSize','fontFamily','|','link','bulletedList','numberedList','selectAll','|',
        'horizontalLine','outdent','indent','|','imageUpload','htmlEmbed','blockQuote','insertTable','mediaEmbed','insertTemplate',
        'specialCharacters','undo','redo','findAndReplace'
    ],
    licenseKey: 'Yk01MXFnaDlIT3BZRHpWejJhWGRrYUZqaEVjNFdaY0h5NHJ0MHBlYXZuNzZvS3lJek9Xck4wdEFxM1VSLU1qQXlNekV4TURrPQ==',
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
    let {recordId, apiUrl, accessToken} = props;
    if(recordId !== undefined && recordId !== null && apiUrl !== null && accessToken !== null) {
        //create rest endpoint for MemorandumContent__c access
        axios.get(recordApiUrl, {
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${accessToken}`
            }
        }).then( response => {
            editorData.value = (response.data?.Body__c !== undefined && response.data?.Body__c !== null)
            ? response.data?.Body__c: '';
            contentName.value  = response.data?.Name;
        })
    } else {
        modalText.value = 'Unable to Retrieve Record.';
        showModal.value = true;
    }
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