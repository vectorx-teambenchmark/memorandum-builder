<script setup>
import axios from 'axios';
import { reactive, ref, onBeforeMount, computed, watch } from 'vue';
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
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
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
                color: '#EEEEEE',
                name: '#EEEEEE'
            },
            {
                color: '#AAAAAA',
                name: '#AAAAAA'
            },
            {
                color: '#47B0DE',
                name: '#47B0DE'
            },
            {
                color: '#468FE8',
                name: '#468FE8'
            },
            {
                color: '#5989B2',
                name: '#5989B2'
            },
            {
                color: '#4A7395',
                name: '#4A7395'
            },
            {
                color: '#446988',
                name: '#446988'
            },
            {
                color: '#D5B176',
                name: '#D5B176'
            },
            {
                color: '#B18F6A',
                name: '#B18F6A'
            },
            {
                color: '#B3704F',
                name: '#B3704F'
            },
            {
                color: '#9C9D98',
                name: '#9C9D98'
            },
            {
                color: '#7B7F80',
                name: '#7B7F80'
            },
            {
                color: '#495A6F',
                name: '#495A6F'
            },
            {
                color: '#2C3C49',
                name: '#2C3C49'
            },
            {
                color: '#222222',
                name: '#222222'
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
const editorInstance = reactive(ClassicEditor);
const editorConfig = computed (()=>{ return {
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
            SourceEditing,
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
                extraPlugins: [ Bold, Italic, DocumentList ]
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
            options: [14,9,10,11,12,16,18,20,24,32,48,60]
        },
        htmlSupport:{
            allow:[
                {
                    name: 'div',
                    attributes: true,
                    classes: true,
                    styles: true
                }
            ]
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
            currentUserUri: props.idUrl,
            contentId: props.recordId
        },
        simpleUpload: {
            uploadUrl: import.meta.env.VITE_IMAGE_PROCESSOR
        },
        style: {
            definitions: [
                {
                    name: 'Heading',
                    element:'p',
                    classes: ['heading']
                },
                {
                    name:'Body',
                    element:'p',
                    classes: ['standard']
                },
                {
                    name:'Footer',
                    element:'p',
                    classes: ['footer']
                },
                {
                    name:'Medium Grey Border',
                    element:'figure',
                    classes:['grey-border']
                },
                {
                    name:'Blue 1 Border',
                    element:'figure',
                    classes:['blue-border-1']
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
                    title: 'Disclaimer',
                    description: 'Templated Disclaimer Text',
                    data: `<div class="slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-1 slds-var-m-bottom_small"><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>The content of this promotion has not been approved by an authorised person within the meaning of the Financial Services and Markets Act 2000. Reliance on this promotion for the purpose of engaging in any investment activity may expose an individual to a significant risk of losing all the property or other assets invested. The sole purpose of this Information Memorandum (“IM”) is to provide information on&nbsp;</strong></span><span style="background-color:transparent;color:#FF0000;font-family:Poppins;"><strong>Company Name Limited&nbsp;</strong></span><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>(“the company”) to those parties who have expressed an interest in the business carried on by the company in order to assist them in assessing whether they wish to make investigation of their own and enter into negotiations to invest in the company. This IM is strictly private and confidential and is intended solely for the information of the Addressee of the accompanying letter (“the Addressee”). It is not an invitation for public subscription and should not be reproduced or circulated or used for any purpose other than assisting with the assessment of the company by the persons to whom this IM is delivered. This IM is made available to you strictly on the basis of the confidentiality agreement that has already been signed and returned by the addressee and constitutes Confidential Information for the purposes of that agreement, and accordingly this document, and all confidential information provided, are returnable in accordance with the terms of the confidentiality agreement before reading, circulating or using this IM.</strong></span></p><p style="text-align:justify;">&nbsp;</p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>This IM falls outside the scope of the Financial Services and Markets Act 2000 and it has not been approved by a person authorised under that Act.</strong></span></p><p style="text-align:justify;">&nbsp;</p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>This IM is being issued by the company who has authorised its issue. Notice is given that:</strong></span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">1. The Information relating to the company contained herein has been provided by the company. This information has not been independently verified.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">2. In no circumstances will the company, or any of its subsidiaries, affiliates, representatives, partners, directors, officers, employees, advisers or agents (collectively “the Relevant Parties”) be responsible for any of the information in this IM, including the forecasts and details on the market. These are supplied as a guide only and do not purport to contain all the information that an interested party may require. By accepting this IM the Addressee acknowledges that it will be solely responsible for making its own investigation, including the costs and expenses incurred, and forming its own view as to the condition and prospects of the company and the accuracy and completeness of the statements contained herein.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">3. This IM includes certain statements, estimates and projections provided by the company with respect to its anticipated future performance. Such statements, estimates and projections reflect various assumptions concerning anticipated results and are subject to significant business, economic and competitive uncertainties and contingencies, many of which are or may be beyond the control of the company.&nbsp; Accordingly, there can be no assurance that such statements, estimates and projections will be realised. The actual results may vary from those projected, and those variations may be material. No representations are or will be made by any party as to the accuracy or completeness of such statements, estimates and projections or that any projection will be achieved.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">4. None of the Relevant Parties has any authority to make or give any representation or warranty whatsoever in relation to the business or prospects of the company and makes no such representation or warranty.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">5. The information contained herein and any further information (whether written, electronic or oral) relating to the company supplied by any of the Relevant Parties is, and will be, supplied on the condition that none of the Relevant Parties or any other person whatsoever is liable for any error, omission, or inaccuracy therein nor for any loss or damage sustained by a purchaser of the business placing reliance on such information, including any error or omission or inaccuracy resulting from any negligent act or omission of any of the Relevant Parties or any other person. No party accepts any responsibility or gives any undertaking to provide further information, including any information required to correct any earlier inaccuracy or error</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">6. The information contained herein does not, and will not, form any part of a contract or offer for sale. Furthermore it does not constitute an offer capable of acceptance and no binding commitment may be entered into on the basis of the information contained herein.</span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">7. None of the Relevant Parties undertake to accept the highest, or any, offer and they reserve the right to accept or reject any offer for any reason. They reserve the right to negotiate with one or more potential parties at any time and to enter into a definitive agreement for a transaction involving the company without prior notice to the recipient of this IM or other potential investors. They also reserve the right to terminate, at any time, further participation in the investigation and proposed process by any party, to modify any of the rules or procedures set forth herein or any other procedures without prior notice or assigning any reason therefore&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">or to terminate the process contemplated hereby. They reserve the right to take any action, whether in or out of the conduct of the company’s businesses, or process contemplated by this IM.&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">8. Neither the receipt of this IM nor any information (whether written, electronic or oral) made available in connection with the proposed sale of the company constitutes, or is to be taken as constituting, the giving of investment advice by any of the Relevant Parties.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">9. Any proposal to purchase the company made in due course must be in accordance with the procedure described separately in the letter from Benchmark addressed to the Addressee.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">10. Only those particular representations and warranties which may be made in a sale and purchase agreement (which will not contain any representations or warranties as to this IM) when and if it is finally executed, and subject to such limitations and restrictions as may be agreed, shall have any legal effect. Accordingly no representations or warranties are given in, or in respect of, this IM or any further information supplied.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">11. The Directors of the company will act as a primary point of contact for interested parties. Unless specifically agreed in writing, under no circumstances should potential interested parties contact other individuals or employees of the company, or visit any sites used by the company.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">12. This IM should not be considered as a recommendation by any of the Relevant Parties to invest in the company, and recipients interested in investing in the company are recommended to seek their own independent financial, legal and other advice from persons authorised and specialising, as necessary, in investments of the kind in question. Recipients should be aware that any investment activity may expose them to a risk of losing the property invested.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">13. Recipients of this IM in jurisdictions outside the UK should inform themselves about and observe all applicable legal requirements in their jurisdictions. In particular, the distribution of this IM in certain jurisdictions may be restricted by law and, accordingly, recipients represent that they are able to receive this IM without contravention of any unfulfilled registration requirements or other legal restrictions in the jurisdiction in which they reside or conduct business.&nbsp;</span></p></div></div>`
                },
                {
                    title: 'Entity Registration (2 Column)',
                    description: 'Two column table at 50% width for Entity Registration Details',
                    data: `<p>&nbsp;</p><figure class="table" style="width:70%;"><table style="background-color:rgb(242,242,242);border:2px solid rgb(162,147,133);"><tbody><tr><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:50%;" colspan="2"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>ENTITY REGISTRATION</strong></span></td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Legal Name</td><td style="padding:.15rem;text-align:center;width:50%;">FROM TAX RETURN</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">FEIN/EIN</td><td style="padding:.15rem;text-align:center;">FROM TAX RETURN</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Incorporation Date / Date Business Started</td><td style="padding:.15rem;text-align:center;">FROM TAX RETURN</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Company Structure</td><td style="padding:.15rem;text-align:center;">[STATE] [BUSINESS STRUCTURE]</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Tax Structure</td><td style="padding:.15rem;text-align:center;">TAX FORM NUMBER</td></tr></tbody></table></figure>`
                },
                {
                    title: 'Entity Registration (4 Column)',
                    description: 'Four column, two row table set at a table width of 80% for Entity Registration Details',
                    data:`<p>&nbsp;</p><figure class="table" style="width:80%;"><table style="background-color:rgb(242,242,242);"><tbody><tr><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>LEGAL NAME</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>FEI/EIN NUMBER</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>DATE ESTABLISHED</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>OWNER</strong></span></td></tr><tr><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td></tr></tbody></table></figure>`
                },
                {
                    title: 'Key Features & Opportunities',
                    description: 'Two column layout for with a table in each column for Key Features and Opportunities.',
                    data:`<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-2"><figure class="table" style="width:80%;"><table style="background-color:hsl(0,0%,84%);"><tbody><tr><td style="padding:1rem;"><span style="color:hsl(205,32%,39%);font-size:20px;"><strong>KEY FEATURES</strong></span></td></tr><tr><td style="padding:.5rem;"><ul><li>Hamburger pork pork belly jerky chuck capicola turducken bresaola.</li><li>Pork belly rump chislic kielbasa pastrami, short ribs frankfurter picanha tri-tip.</li><li>Sirloin pancetta pastrami strip steak.</li><li>Alcatra hamburger cupim, pastrami porchetta frankfurter brisket cow sirloin pork loin prosciutto turducken buffalo.</li></ul></td></tr></tbody></table></figure></div><div class="template slds-col slds-size_1-of-2"><figure class="table" style="width:80%;"><table style="background-color:hsl(0,0%,84%);"><tbody><tr><td style="padding:1rem;"><span style="color:hsl(205,32%,39%);font-size:20px;"><strong>OPPORTUNITIES</strong></span></td></tr><tr><td style="padding:.5rem;"><ul><li>Bacon ipsum dolor amet bresaola strip steak tenderloin, meatball andouille pig corned beef frankfurter tri-tip.&nbsp;</li><li>Spare ribs pork loin frankfurter beef, ribeye fatback boudin bacon ham pastrami ham hock hamburger burgdoggen.</li><li>Turkey tongue picanha shankle.</li><li>Pork loin leberkas ham capicola porchetta corned beef.</li></ul></td></tr></tbody></table></figure></div></div><p>&nbsp;</p>`
                },
                {
                    title:'Highlight Box',
                    description: 'A table that serves as a highlight box.',
                    data: '<p>&nbsp;</p><figure class="table" style="width:13.73%;"><table class="ck-table-resized" style="border:.15rem solid hsl(207,25%,23%);"><colgroup><col style="width:13.93%;"><col style="width:86.07%;"></colgroup><thead><tr><th style="background-color:hsl(207,25%,23%);" colspan="2"><p style="text-align:center;"><span style="color:hsl(0,0%,100%);font-family:\'Passenger Display Bold\';font-size:24px;">Title</span></p></th></tr></thead><tbody><tr><td style="width:5%;">&nbsp;</td><td style="width:95%;"><ul><li><span style="font-family:Poppins;font-size:12px;">Turducken sed buffalo nulla, prosciutto boudin dolore fatback.</span></li><li><span style="font-family:Poppins;font-size:12px;">Bacon ipsum dolor amet irure ex flank t-bone, quis buffalo tail pariatur rump aliqua drumstick frankfurter corned beef non.</span></li><li><span style="font-family:Poppins;font-size:12px;">Duis anim dolor officia id.</span></li></ul></td></tr></tbody></table></figure><p>&nbsp;</p>'
                },
                {
                    title: 'Table - 15 Row Table',
                    description: 'A Table with 3 columns and 15 rows.',
                    data: '<p>&nbsp;</p><figure class="table" style="width:100%;"><table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p>'
                },
                {
                    title: 'Table - 20 Row Table',
                    description: 'A Table with 3 columns and 20 rows.',
                    data: '<p>&nbsp;</p><figure class="table" style="width:100%;"><table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p>'
                },
                {
                    title:'Table - Bordered with Colored Heading',
                    description: 'A table that has a solid border and a colored header - Listing Properites',
                    data: `<p>&nbsp;</p><figure class="table" style="width:100%;"><table style="border:2px solid rgb(162,147,133);"><tbody><tr><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:28%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>ADDRESS</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>SQ. FT.</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>MONTHLY RENT</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>LEASE TERMS</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>OWNER</strong></span></td></tr><tr><td style="text-align:center;width:28%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td></tr><tr><td style="text-align:center;width:28%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p>`
                },
                {
                    title: 'Table - Product and GP Margin Display',
                    description: 'Two column table to display Products and the Related GP Margins',
                    data: `<p>&nbsp;</p><figure class="table" style="width:100%;"><table style="background-color:rgb(242,242,242);"><tbody><tr><td style="background-color:rgb(162,147,133);padding:.2rem;vertical-align:top;width:50%;"><span style="color:hsl(0,0%,100%);"><strong>Product / Service</strong></span></td><td style="background-color:rgb(162,147,133);padding:.2rem;text-align:right;vertical-align:top;width:50%;"><span style="color:hsl(0,0%,100%);"><strong>GP Margin</strong></span></td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p>`
                },
                {
                    title: 'Table - Shareholder Table',
                    description: 'A Three colum shaded table with colored header - For shareholder listing',
                    data: `<p>&nbsp;</p><figure class="table" style="width:100%;"><table style="background-color:rgb(242,242,242);border:2px solid rgb(162,147,133);"><tbody><tr><td style="background-color:rgb(162,147,133);padding:.5rem;width:33%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>SHAREHOLDER</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:33%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>% OWNED</strong></span></td><td style="background-color:rgb(162,147,133);padding:.5rem;text-align:center;width:33%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>POSITION</strong></span></td></tr><tr><td style="padding:.3rem;width:33%;">Insert Text</td><td style="padding:.3rem;text-align:center;width:33%;">X%</td><td style="padding:.3rem;text-align:center;width:33%;">Insert Text</td></tr><tr><td style="padding:.3rem;width:33%;">Insert Text</td><td style="padding:.3rem;text-align:center;width:33%;">X%</td><td style="padding:.3rem;text-align:center;width:33%;">Insert Text</td></tr><tr><td style="padding:.3rem;width:33%;">Insert Text</td><td style="padding:.3rem;text-align:center;width:33%;">X%</td><td style="padding:.3rem;text-align:center;width:33%;">Insert Text</td></tr></tbody></table></figure><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Column Layout - Evenly Distributed',
                    description: 'Two column Layout using no tables, evenly distributed.',
                    data: `<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="margin-left:0px;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="margin-left:0px;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Column Layout - 60/40',
                    description: 'Two column Layout using no tables, 60 to 40 colum ratio',
                    data: `<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_7-of-12 slds-var-p-right_small"><p style="text-align:justify;">Tenderloin short ribs frankfurter swine boudin meatloaf tri-tip ham t-bone. Chislic landjaeger t-bone tri-tip, buffalo filet mignon strip steak capicola alcatra tongue doner. Beef ribs turkey pancetta chuck tenderloin, jerky flank kielbasa turducken jowl bacon. Kielbasa burgdoggen spare ribs fatback. Ham kielbasa short loin, tri-tip biltong jowl spare ribs turkey turducken. Tri-tip swine shoulder beef ribs doner turducken sirloin buffalo meatloaf jerky strip steak. Leberkas chislic burgdoggen, pancetta ham fatback chuck meatball short ribs bacon pork chop tenderloin sirloin.</p><p style="text-align:justify;">Short loin porchetta flank ball tip pork filet mignon. Venison pork chop tail chicken ribeye boudin. Landjaeger jerky spare ribs t-bone ham pork belly. Pancetta pork belly short ribs pork loin hamburger tail. Chislic turducken swine hamburger porchetta. Leberkas swine flank strip steak turducken chuck, pork venison ham.</p><p style="text-align:justify;">Biltong bacon buffalo salami short ribs. Pork loin tail cow, bacon jerky boudin jowl chuck. Leberkas buffalo tail jowl salami pig pastrami picanha drumstick. Fatback chuck salami alcatra frankfurter ham swine shoulder tenderloin. Corned beef tongue turducken ball tip, kevin meatloaf tail. Strip steak pastrami cow, pork chop beef ribeye prosciutto pork loin kielbasa meatball ham hock andouille filet mignon beef ribs landjaeger. Chicken sirloin beef, pork belly tail jowl hamburger salami andouille.</p></div><div class="template slds-col slds-size_5-of-12 slds-var-p-left_small"><p style="text-align:justify;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;text-align:justify;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Column Layout - 66/33',
                    description: 'Two column layout using no tables 3 to 1 column ratio',
                    data: `<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_2-of-3 slds-var-p-right_small"><p style="margin-left:0px;text-align:justify;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;text-align:justify;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p></div><div class="template slds-col slds-size_1-of-3 slds-var-p-left_small"><p style="text-align:justify;">Tenderloin short ribs frankfurter swine boudin meatloaf tri-tip ham t-bone. Chislic landjaeger t-bone tri-tip, buffalo filet mignon strip steak capicola alcatra tongue doner. Beef ribs turkey pancetta chuck tenderloin, jerky flank kielbasa turducken jowl bacon. Kielbasa burgdoggen spare ribs fatback. Ham kielbasa short loin, tri-tip biltong jowl spare ribs turkey turducken. Tri-tip swine shoulder beef ribs doner turducken sirloin buffalo meatloaf jerky strip steak. Leberkas chislic burgdoggen, pancetta ham fatback chuck meatball short ribs bacon pork chop tenderloin sirloin.</p><p style="margin-left:0px;text-align:justify;">Short loin porchetta flank ball tip pork filet mignon. Venison pork chop tail chicken ribeye boudin. Landjaeger jerky spare ribs t-bone ham pork belly. Pancetta pork belly short ribs pork loin hamburger tail. Chislic turducken swine hamburger porchetta. Leberkas swine flank strip steak turducken chuck, pork venison ham.</p><p style="margin-left:0px;text-align:justify;">Biltong bacon buffalo salami short ribs. Pork loin tail cow, bacon jerky boudin jowl chuck. Leberkas buffalo tail jowl salami pig pastrami picanha drumstick. Fatback chuck salami alcatra frankfurter ham swine shoulder tenderloin. Corned beef tongue turducken ball tip, kevin meatloaf tail. Strip steak pastrami cow, pork chop beef ribeye prosciutto pork loin kielbasa meatball ham hock andouille filet mignon beef ribs landjaeger. Chicken sirloin beef, pork belly tail jowl hamburger salami andouille.</p></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Column Layout - 80/20',
                    description: 'Two Column Layout using no tables 4 to 1 column ratio',
                    data: `<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="slds-col slds-size_4-of-5 slds-var-p-right_small template"><p>Bacon ipsum dolor amet pork doner pig corned beef. Landjaeger burgdoggen cupim kevin, flank tongue porchetta ham hock t-bone short ribs brisket. Tenderloin tri-tip shank short ribs pig. Salami leberkas kielbasa chuck. Corned beef kielbasa strip steak, buffalo pork loin meatloaf meatball andouille shoulder tenderloin chicken ham brisket ham hock pork. Bacon sirloin filet mignon jowl flank biltong prosciutto venison rump frankfurter picanha turducken kevin.</p></div><div class="slds-col slds-size_1-of-5 slds-var-p-left_small template"><p><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Bacon ipsum dolor amet pork doner pig corned beef. Landjaeger burgdoggen cupim kevin, flank tongue porchetta ham hock t-bone short ribs brisket. Tenderloin tri-tip shank short ribs pig. Salami leberkas kielbasa chuck. Corned beef kielbasa strip steak, buffalo pork loin meatloaf meatball andouille shoulder tenderloin chicken ham brisket ham hock pork. Bacon sirloin filet mignon jowl flank biltong prosciutto venison rump frankfurter picanha turducken kevin.</span></p></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Column Layout - 3 Sections 2 / 1',
                    description: 'Two column tableless layout with 2 sections in column 1 and 1 section in column 2',
                    data: `<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-1"><p style="text-align:justify;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;text-align:justify;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p><p style="margin-left:0px;">&nbsp;</p></div><div class="template slds-col slds-size_1-of-1"><p style="text-align:justify;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;text-align:justify;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p></div></div></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="margin-left:0px;">Bacon ipsum dolor amet shankle chislic ribeye andouille beef ribs meatloaf spare ribs. Doner pancetta rump chuck jowl cow pork belly bacon chislic. Fatback doner jowl pancetta meatball chicken. Boudin ham alcatra, doner frankfurter short loin turkey salami landjaeger pig. Leberkas meatball ribeye capicola pig cow tongue biltong strip steak bresaola beef tail drumstick shoulder kevin.</p><p style="margin-left:0px;">Salami bacon jerky, ham hock pastrami ribeye pig turducken biltong shankle pork chop short ribs tenderloin doner short loin. Short ribs tongue kevin shankle, shoulder salami meatball chuck. Kevin flank ribeye frankfurter. Buffalo shankle landjaeger shoulder beef. Porchetta meatloaf drumstick pancetta, ribeye t-bone bresaola short ribs. Tongue capicola spare ribs pork loin salami prosciutto pig ground round rump kielbasa t-bone shankle turducken andouille.</p></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Four Sections',
                    description: 'Tableless layout with four sections',
                    data: `<p>&nbsp;</p><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-1 slds-var-m-top_small"><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Bacon ipsum dolor amet leberkas brisket sausage pastrami shoulder rump, capicola shank tail flank hamburger tenderloin shankle. Brisket pork belly venison tenderloin beef kevin chicken chuck fatback, kielbasa pig. Jerky pastrami picanha tenderloin. Turducken cow biltong pork, shoulder chislic flank ham porchetta burgdoggen. Chuck doner kielbasa turkey fatback tongue ham. Sirloin prosciutto ham beef ribs, tri-tip burgdoggen ham hock kevin pastrami jerky kielbasa. Doner beef ribs kielbasa strip steak cupim ball tip chuck meatloaf landjaeger tenderloin shankle jerky corned beef venison.</span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Beef pork ham strip steak short ribs burgdoggen pastrami hamburger ribeye filet mignon rump boudin shank. Rump salami porchetta t-bone tail meatball beef ribs fatback meatloaf pork chop cupim ball tip. Prosciutto kevin swine pancetta, ball tip rump jerky sirloin porchetta drumstick landjaeger. Landjaeger bresaola jowl, pork pork belly picanha beef jerky prosciutto tail venison. Burgdoggen capicola doner rump shoulder. Venison porchetta drumstick picanha buffalo doner meatball pancetta bresaola tail cow beef ribs. Picanha doner beef ribs pancetta pork t-bone.</span></p></div></div></div><div class="template slds-col slds-size_1-of-1 slds-var-m-top_small"><div class="template slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Ground round chicken prosciutto, venison jerky jowl buffalo cupim flank sirloin tail strip steak swine. Salami strip steak meatloaf jerky chicken rump pastrami jowl kielbasa t-bone prosciutto tri-tip pork. Buffalo venison short loin burgdoggen pastrami chislic tenderloin bacon. Cow turkey capicola, doner pastrami tri-tip cupim shankle ham hock pig chicken boudin tail. Ham hock filet mignon brisket capicola, turducken picanha shank pork loin tongue sausage spare ribs leberkas. Chislic t-bone tri-tip strip steak pork frankfurter. Buffalo chicken tri-tip swine tail hamburger.</span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Meatloaf tongue porchetta, frankfurter buffalo pork belly ham prosciutto. Pork loin doner cupim, beef ribs flank brisket alcatra spare ribs picanha sirloin t-bone filet mignon corned beef. Swine pork chop bresaola meatball drumstick doner porchetta biltong picanha spare ribs short loin jowl meatloaf. Ham hock sausage brisket biltong, swine drumstick porchetta spare ribs t-bone. Alcatra pig chicken beef ribs.</span></p></div></div></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Rows, Three Sections 1 / 2',
                    description: 'Tableless layout with two rows, the first row is one column, the second row has two columns',
                    data: `<p>&nbsp;</p><div class="slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-1 slds-var-m-bottom_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Bacon ipsum dolor amet leberkas brisket sausage pastrami shoulder rump, capicola shank tail flank hamburger tenderloin shankle. Brisket pork belly venison tenderloin beef kevin chicken chuck fatback, kielbasa pig. Jerky pastrami picanha tenderloin. Turducken cow biltong pork, shoulder chislic flank ham porchetta burgdoggen. Chuck doner kielbasa turkey fatback tongue ham. Sirloin prosciutto ham beef ribs, tri-tip burgdoggen ham hock kevin pastrami jerky kielbasa. Doner beef ribs kielbasa strip steak cupim ball tip chuck meatloaf landjaeger tenderloin shankle jerky corned beef venison.</span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="text-align:justify;">Beef pork ham strip steak short ribs burgdoggen pastrami hamburger ribeye filet mignon rump boudin shank. Rump salami porchetta t-bone tail meatball beef ribs fatback meatloaf pork chop cupim ball tip. Prosciutto kevin swine pancetta, ball tip rump jerky sirloin porchetta drumstick landjaeger. Landjaeger bresaola jowl, pork pork belly picanha beef jerky prosciutto tail venison. Burgdoggen capicola doner rump shoulder. Venison porchetta drumstick picanha buffalo doner meatball pancetta bresaola tail cow beef ribs. Picanha doner beef ribs pancetta pork t-bone.</p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="text-align:justify;">Ground round chicken prosciutto, venison jerky jowl buffalo cupim flank sirloin tail strip steak swine. Salami strip steak meatloaf jerky chicken rump pastrami jowl kielbasa t-bone prosciutto tri-tip pork. Buffalo venison short loin burgdoggen pastrami chislic tenderloin bacon. Cow turkey capicola, doner pastrami tri-tip cupim shankle ham hock pig chicken boudin tail. Ham hock filet mignon brisket capicola, turducken picanha shank pork loin tongue sausage spare ribs leberkas. Chislic t-bone tri-tip strip steak pork frankfurter. Buffalo chicken tri-tip swine tail hamburger.</p></div></div><p>&nbsp;</p>`
                },
                {
                    title: 'Layout - Two Rows, Three Sections 2 / 1',
                    description: 'Tableless layout with two rows, the first row has two columns, the second has one column',
                    data: `<p>&nbsp;</p><div class="slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Ground round chicken prosciutto, venison jerky jowl buffalo cupim flank sirloin tail strip steak swine. Salami strip steak meatloaf jerky chicken rump pastrami jowl kielbasa t-bone prosciutto tri-tip pork. Buffalo venison short loin burgdoggen pastrami chislic tenderloin bacon. Cow turkey capicola, doner pastrami tri-tip cupim shankle ham hock pig chicken boudin tail. Ham hock filet mignon brisket capicola, turducken picanha shank pork loin tongue sausage spare ribs leberkas. Chislic t-bone tri-tip strip steak pork frankfurter. Buffalo chicken tri-tip swine tail hamburger.</span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Beef pork ham strip steak short ribs burgdoggen pastrami hamburger ribeye filet mignon rump boudin shank. Rump salami porchetta t-bone tail meatball beef ribs fatback meatloaf pork chop cupim ball tip. Prosciutto kevin swine pancetta, ball tip rump jerky sirloin porchetta drumstick landjaeger. Landjaeger bresaola jowl, pork pork belly picanha beef jerky prosciutto tail venison. Burgdoggen capicola doner rump shoulder. Venison porchetta drumstick picanha buffalo doner meatball pancetta bresaola tail cow beef ribs. Picanha doner beef ribs pancetta pork t-bone.</span></p></div><div class="template slds-col slds-size_1-of-1 slds-var-m-top_small"><p style="text-align:justify;"><span style="background-color:rgb(255,255,255);color:rgb(51,51,51);font-size:16px;">Bacon ipsum dolor amet leberkas brisket sausage pastrami shoulder rump, capicola shank tail flank hamburger tenderloin shankle. Brisket pork belly venison tenderloin beef kevin chicken chuck fatback, kielbasa pig. Jerky pastrami picanha tenderloin. Turducken cow biltong pork, shoulder chislic flank ham porchetta burgdoggen. Chuck doner kielbasa turkey fatback tongue ham. Sirloin prosciutto ham beef ribs, tri-tip burgdoggen ham hock kevin pastrami jerky kielbasa. Doner beef ribs kielbasa strip steak cupim ball tip chuck meatloaf landjaeger tenderloin shankle jerky corned beef venison.</span></p></div></div><p>&nbsp;</p>`
                }
            ]
        },
        toolbar: ['sourceEditing','style',
            'alignment','bold','italic','underline','strikethrough','subscript','superscript','removeFormat','formatPainter','|',
            'fontBackgroundColor','fontColor','fontSize','fontFamily','|','link','bulletedList','numberedList','selectAll','|',
            'horizontalLine','outdent','indent','|','imageUpload','htmlEmbed','blockQuote','insertTable','mediaEmbed','insertTemplate',
            'specialCharacters','undo','redo','findAndReplace','|','comment','commentsArchive'
        ],
        licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE,
    };
});
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
    console.log('The record Id has changed. %s',newValue);
    sessionStorage.setItem('currentRecordId',newValue);
    refreshContentRecord(newValue);
});
/**
 * Lifecycle methods
 */
onBeforeMount(()=>{
    refreshContentRecord(props.recordId);
    sessionStorage.setItem('currentRecordId',props.recordId);
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
                <button class="slds-button slds-button_destructive" v-on:click="displayRenameContentForm = false">Cancel</button>
            </div>
        </div>
    </div>
    <!-- END : Header and Actions-->

    <ckeditor :editor="editorInstance" v-model="editorData" :config="editorConfig" :disabled="showOnlyComments" />
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
        font-family: 'Poppins';
        font-size: 12pt;
        line-height: 18pt;
        color: #222;
        text-align: justify;
    }
    .ck.ck-content p {
        text-align: justify;
    }
    .ck.ck-content div.template {
        border: dotted 1px red; 
    }
    .heading {
        font-family: 'Passenger Display Extra Bold';
        font-size: 18pt;
        letter-spacing: .2rem;
        line-height: 22pt;
        color: #47B0DE;
    }
    .standard {
        font-family: 'Poppins';
        font-size: 12pt;
        line-height: 18pt;
        color: #222;
    }
    .footer {
        font-family: 'Poppins';
        font-size: 10pt;
        color: #DEDEDE;
    }
    .grey-border {
        border: 2px solid hsl(0,0%,65%);
    }
    .blue-border-1 {
        border: 2px solid  hsl(214,73%,58%);
    }
    ::selection {
        background: red;
    }


</style>