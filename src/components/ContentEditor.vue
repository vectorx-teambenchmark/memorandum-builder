<script setup>
import axios from 'axios';
import { ref, onBeforeMount, onMounted, computed, watch, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
//updated imports for ckeditor 5 since version 45
import { ClassicEditor, Essentials, Alignment, Bold, Italic, Subscript, Superscript, Underline, 
    BlockQuote, FindAndReplace, GeneralHtmlSupport, List, ListProperties, FontBackgroundColor, FontColor, FontFamily, 
    FontSize, HorizontalLine, HtmlEmbed, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, ImageUpload,
    Indent, IndentBlock, Link, LinkImage, MediaEmbed, MediaEmbedToolbar, Mention, Paragraph, PasteFromOffice, RemoveFormat, SelectAll,
    SimpleUploadAdapter, SourceEditing, SpecialCharacters, SpecialCharactersArrows, SpecialCharactersCurrency, SpecialCharactersEssentials,
    SpecialCharactersLatin, SpecialCharactersMathematical, SpecialCharactersText, Style, Table, TableCaption, TableCellProperties,
    TableColumnResize, TableProperties, TableToolbar, WordCount
} from 'ckeditor5';
import { Comments, FormatPainter, PasteFromOfficeEnhanced, SlashCommand, Template, RevisionHistory } from 'ckeditor5-premium-features';
import { CommentsAdapter } from '../utils/ckeditor-adapter/CommentsAdapter';
import { RevisionHistoryAdapter } from '../utils/ckeditor-adapter/RevisionHistoryAdapter';
import CommentList from './list/CommentList.vue';
import useAuthStore from '../stores/auth';
import useProcessStatusStore from '../stores/processStatus';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

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

const router = useRouter();

const editorContainer = useTemplateRef('editorContainerElement');
const editorRevisionHistory = useTemplateRef('editorRevisionHistoryElement');
const editorRevisionHistoryEditor = useTemplateRef('editorRevisionHistoryEditorElement');
const editorRevisionHistorySidebar = useTemplateRef('editorRevisionHistorySidebarElement');

const contentName = computed(() => {
    return content.value?.Parent__r?.Name + ' - ' + content.value?.Name;
});

const colorArray = computed(() => {
    return [
        {color: '#EEEEEE', name: '#EEEEEE'}, {color: '#AAAAAA', name: '#AAAAAA'}, {color: '#47B0DE', name: '#47B0DE'},
        {color: '#468FE8', name: '#468FE8'}, {color: '#5989B2', name: '#5989B2'}, {color: '#4A7395', name: '#4A7395'},
        {color: '#446988', name: '#446988'}, {color: '#D5B176', name: '#D5B176'}, {color: '#B18F6A', name: '#B18F6A'},
        {color: '#B3704F', name: '#B3704F'}, {color: '#9C9D98', name: '#9C9D98'}, {color: '#7B7F80', name: '#7B7F80'},
        {color: '#495A6F', name: '#495A6F'}, {color: '#2C3C49', name: '#2C3C49'}, {color: '#222222', name: '#222222'}
    ];
});
const config = computed(()=>{
    if(!isLayoutReady.value) {
        return null;
    }
    return {
        licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE,
        salesforceApi: {
            baseUri: props.apiUrl,
            accessToken: props.accessToken,
            currentUserUri: props.idUrl,
            contentId: props.recordId
        },
        plugins: [
            Alignment, BlockQuote, Bold, Comments, List, ListProperties, Essentials, FindAndReplace, FontBackgroundColor,
            FontColor, FontFamily, FontSize, FormatPainter, GeneralHtmlSupport, HorizontalLine, HtmlEmbed, Italic, Image, ImageCaption,
            ImageResize, ImageStyle, ImageToolbar, ImageUpload, Indent, IndentBlock, Link, LinkImage, MediaEmbed, MediaEmbedToolbar,
            Mention, Paragraph, PasteFromOffice, PasteFromOfficeEnhanced, RemoveFormat, RevisionHistory, SelectAll, SimpleUploadAdapter,
            SlashCommand, SourceEditing, SpecialCharacters, SpecialCharactersArrows, SpecialCharactersCurrency, SpecialCharactersEssentials,
            SpecialCharactersLatin, SpecialCharactersMathematical, SpecialCharactersText, Style, Subscript, Superscript, Table,
            TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar, Template, Underline, WordCount
        ],
        extraPlugins: [ CommentsAdapter, RevisionHistoryAdapter ],
        toolbar: [
            'style','alignment','bold','italic','underline','strikethough','subscript','superscript','removeFormat','formatPainter','|',
            'fontBackgroundColor','fontColor','fontSize','fontFamily','|',
            'link','bulletedList','numberedList','selectAll','|',
            'horizontalLine','outdent','indent','|',
            'imageUpload','blockQuote','insertTable','mediaEmbed','insertTemplate','specialCharacters','undo','redo','findAndReplace','|',
            'comment','commentsArchive','revisionHistory'
        ],
        extraPlugins: [],
        comments: {
            editorConfig: { extraPlugins: [ Bold, Italic, List ] }
        },
        fontBackgroundColor: {
            colors: colorArray.value
        },
        fontColor: {
            colors: colorArray.value
        },
        fontFamily: {
            options: [
                'Poppins','Passenger Display Regular','Passenger Display Bold','Passenger Display Bold Italic',
                'Passenger Display Extra Bold','Passenger Display Extra Bold Italic','Passenger Display Extra Light',
                'Passenger Display Extra Light Italic'
            ]
        },
        fontSize: {
            options: [14,9,10,11,12,16,18,20,24,32,48,60]
        },
        htmlSupport:{
            allow:[{ name: 'div', attributes: true, classes: true, styles: true }]
        },
        image: {
            insert: {type:'block'},
            toolbar: ['imageTextAlternative','toggleImageCaption','linkImage','|',
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
            removeProviders:['vimeo'],
            extraProviders:[
                {
                    name: 'securevimeo',
                    url: /^(https?:\/\/)?player\.vimeo\.com\/.*\/([0-9]+\?h=.*)$/,
                    html: match => `<div style="position: relative; padding-bottom: 50%; height: 0;">
                        <iframe src="https://player.vimeo.com/video/${match[2]}" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" frameborder="0" allowfullscreen></iframe>
                        </div>`
                }  
            ],
            toolbar:[
                {
                    // Grouping the buttons for the icon-like image styling
                    // into one drop-down.
                    name: 'imageStyle:icons',
                    title: 'Alignment',
                    items: ['imageStyle:margin-left','imageStyle:margin-right','imageStyle:inline'],
                    defaultItem: 'imageStyle:margin-left'
                }
            ]
        },
        revisionHistory: {
            editorContainer: editorContainer.value,
            viewerContainer: editorRevisionHistory.value,
            viewerEditorElement: editorRevisionHistoryEditor.value,
            viewerSidebarContainer: editorRevisionHistorySidebar.value,
            resumeUnsavedRevision: false
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
            contentToolbar: ['tableColumn','tableRow','mergeTableCells','tableCellProperties','tableProperties'],
            tableProperties: { borderColors: colorArray.value, backgroundColors: colorArray.value },
            tableCellProperties: { borderColors: colorArray.value, backgroundColors: colorArray.value }
        },
        template: {
            definitions: [
                {
                    title: 'Disclaimer',
                    description: 'Templated Disclaimer Text',
                    data: `<div class="slds-grid slds-wrap"><div class="template slds-col slds-size_1-of-1 slds-var-m-bottom_small"><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>THE CONTENT OF THIS PROMOTION HAS NOT BEEN APPROVED BY AN AUTHORISED PERSON WITHIN THE MEANING OF THE FINANCIAL SERVICES AND MARKETS ACT 2000. RELIANCE ON THIS PROMOTION FOR THE PURPOSE OF ENGAGING IN ANY INVESTMENT ACTIVITY MAY EXPOSE AN INDIVIDUAL TO A SIGNIFICANT RISK OF LOSING ALL THE PROPERTY OR OTHER ASSETS INVESTED. THE SOLE PURPOSE OF THIS INFORMATION MEMORANDUM (“IM”) IS TO PROVIDE INFORMATION ON&nbsp;</strong></span><span style="background-color:transparent;color:#FF0000;font-family:Poppins;"><strong>COMPANY NAME LIMITED&nbsp;</strong></span><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>(“THE COMPANY”) TO THOSE PARTIES WHO HAVE EXPRESSED AN INTEREST IN THE BUSINESS CARRIED ON BY THE COMPANY IN ORDER TO ASSIST THEM IN ASSESSING WHETHER THEY WISH TO MAKE INVESTIGATION OF THEIR OWN AND ENTER INTO NEGOTIATIONS TO INVEST IN THE COMPANY. THIS IM IS STRICTLY PRIVATE AND CONFIDENTIAL AND IS INTENDED SOLELY FOR THE INFORMATION OF THE ADDRESSEE OF THE ACCOMPANYING LETTER (“THE ADDRESSEE”). IT IS NOT AN INVITATION FOR PUBLIC SUBSCRIPTION AND SHOULD NOT BE REPRODUCED OR CIRCULATED OR USED FOR ANY PURPOSE OTHER THAN ASSISTING WITH THE ASSESSMENT OF THE COMPANY BY THE PERSONS TO WHOM THIS IM IS DELIVERED. THIS IM IS MADE AVAILABLE TO YOU STRICTLY ON THE BASIS OF THE CONFIDENTIALITY AGREEMENT THAT HAS ALREADY BEEN SIGNED AND RETURNED BY THE ADDRESSEE AND CONSTITUTES CONFIDENTIAL INFORMATION FOR THE PURPOSES OF THAT AGREEMENT, AND ACCORDINGLY THIS DOCUMENT, AND ALL CONFIDENTIAL INFORMATION PROVIDED, ARE RETURNABLE IN ACCORDANCE WITH THE TERMS OF THE CONFIDENTIALITY AGREEMENT BEFORE READING, CIRCULATING OR USING THIS IM.</strong></span></p><p style="text-align:justify;">&nbsp;</p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>THIS IM FALLS OUTSIDE THE SCOPE OF THE FINANCIAL SERVICES AND MARKETS ACT 2000 AND IT HAS NOT BEEN APPROVED BY A PERSON AUTHORISED UNDER THAT ACT.</strong></span></p><p style="text-align:justify;">&nbsp;</p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;font-family:Poppins;"><strong>THIS IM IS BEING ISSUED BY THE COMPANY WHO HAS AUTHORISED ITS ISSUE. NOTICE IS GIVEN THAT:</strong></span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-right_small"><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">1. THE INFORMATION RELATING TO THE COMPANY CONTAINED HEREIN HAS BEEN PROVIDED BY THE COMPANY. THIS INFORMATION HAS NOT BEEN INDEPENDENTLY VERIFIED.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">2. IN NO CIRCUMSTANCES WILL THE COMPANY, OR ANY OF ITS SUBSIDIARIES, AFFILIATES, REPRESENTATIVES, PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, ADVISERS OR AGENTS (COLLECTIVELY “THE RELEVANT PARTIES”) BE RESPONSIBLE FOR ANY OF THE INFORMATION IN THIS IM, INCLUDING THE FORECASTS AND DETAILS ON THE MARKET. THESE ARE SUPPLIED AS A GUIDE ONLY AND DO NOT PURPORT TO CONTAIN ALL THE INFORMATION THAT AN INTERESTED PARTY MAY REQUIRE. BY ACCEPTING THIS IM THE ADDRESSEE ACKNOWLEDGES THAT IT WILL BE SOLELY RESPONSIBLE FOR MAKING ITS OWN INVESTIGATION, INCLUDING THE COSTS AND EXPENSES INCURRED, AND FORMING ITS OWN VIEW AS TO THE CONDITION AND PROSPECTS OF THE COMPANY AND THE ACCURACY AND COMPLETENESS OF THE STATEMENTS CONTAINED HEREIN.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">3. THIS IM INCLUDES CERTAIN STATEMENTS, ESTIMATES AND PROJECTIONS PROVIDED BY THE COMPANY WITH RESPECT TO ITS ANTICIPATED FUTURE PERFORMANCE. SUCH STATEMENTS, ESTIMATES AND PROJECTIONS REFLECT VARIOUS ASSUMPTIONS CONCERNING ANTICIPATED RESULTS AND ARE SUBJECT TO SIGNIFICANT BUSINESS, ECONOMIC AND COMPETITIVE UNCERTAINTIES AND CONTINGENCIES, MANY OF WHICH ARE OR MAY BE BEYOND THE CONTROL OF THE COMPANY.&NBSP; ACCORDINGLY, THERE CAN BE NO ASSURANCE THAT SUCH STATEMENTS, ESTIMATES AND PROJECTIONS WILL BE REALISED. THE ACTUAL RESULTS MAY VARY FROM THOSE PROJECTED, AND THOSE VARIATIONS MAY BE MATERIAL. NO REPRESENTATIONS ARE OR WILL BE MADE BY ANY PARTY AS TO THE ACCURACY OR COMPLETENESS OF SUCH STATEMENTS, ESTIMATES AND PROJECTIONS OR THAT ANY PROJECTION WILL BE ACHIEVED.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">4. NONE OF THE RELEVANT PARTIES HAS ANY AUTHORITY TO MAKE OR GIVE ANY REPRESENTATION OR WARRANTY WHATSOEVER IN RELATION TO THE BUSINESS OR PROSPECTS OF THE COMPANY AND MAKES NO SUCH REPRESENTATION OR WARRANTY.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">5. THE INFORMATION CONTAINED HEREIN AND ANY FURTHER INFORMATION (WHETHER WRITTEN, ELECTRONIC OR ORAL) RELATING TO THE COMPANY SUPPLIED BY ANY OF THE RELEVANT PARTIES IS, AND WILL BE, SUPPLIED ON THE CONDITION THAT NONE OF THE RELEVANT PARTIES OR ANY OTHER PERSON WHATSOEVER IS LIABLE FOR ANY ERROR, OMISSION, OR INACCURACY THEREIN NOR FOR ANY LOSS OR DAMAGE SUSTAINED BY A PURCHASER OF THE BUSINESS PLACING RELIANCE ON SUCH INFORMATION, INCLUDING ANY ERROR OR OMISSION OR INACCURACY RESULTING FROM ANY NEGLIGENT ACT OR OMISSION OF ANY OF THE RELEVANT PARTIES OR ANY OTHER PERSON. NO PARTY ACCEPTS ANY RESPONSIBILITY OR GIVES ANY UNDERTAKING TO PROVIDE FURTHER INFORMATION, INCLUDING ANY INFORMATION REQUIRED TO CORRECT ANY EARLIER INACCURACY OR ERROR</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">6. THE INFORMATION CONTAINED HEREIN DOES NOT, AND WILL NOT, FORM ANY PART OF A CONTRACT OR OFFER FOR SALE. FURTHERMORE IT DOES NOT CONSTITUTE AN OFFER CAPABLE OF ACCEPTANCE AND NO BINDING COMMITMENT MAY BE ENTERED INTO ON THE BASIS OF THE INFORMATION CONTAINED HEREIN.</span></p></div><div class="template slds-col slds-size_1-of-2 slds-var-p-left_small"><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">7. NONE OF THE RELEVANT PARTIES UNDERTAKE TO ACCEPT THE HIGHEST, OR ANY, OFFER AND THEY RESERVE THE RIGHT TO ACCEPT OR REJECT ANY OFFER FOR ANY REASON. THEY RESERVE THE RIGHT TO NEGOTIATE WITH ONE OR MORE POTENTIAL PARTIES AT ANY TIME AND TO ENTER INTO A DEFINITIVE AGREEMENT FOR A TRANSACTION INVOLVING THE COMPANY WITHOUT PRIOR NOTICE TO THE RECIPIENT OF THIS IM OR OTHER POTENTIAL INVESTORS. THEY ALSO RESERVE THE RIGHT TO TERMINATE, AT ANY TIME, FURTHER PARTICIPATION IN THE INVESTIGATION AND PROPOSED PROCESS BY ANY PARTY, TO MODIFY ANY OF THE RULES OR PROCEDURES SET FORTH HEREIN OR ANY OTHER PROCEDURES WITHOUT PRIOR NOTICE OR ASSIGNING ANY REASON THEREFORE&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">OR TO TERMINATE THE PROCESS CONTEMPLATED HEREBY. THEY RESERVE THE RIGHT TO TAKE ANY ACTION, WHETHER IN OR OUT OF THE CONDUCT OF THE COMPANY’S BUSINESSES, OR PROCESS CONTEMPLATED BY THIS IM.&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">8. NEITHER THE RECEIPT OF THIS IM NOR ANY INFORMATION (WHETHER WRITTEN, ELECTRONIC OR ORAL) MADE AVAILABLE IN CONNECTION WITH THE PROPOSED SALE OF THE COMPANY CONSTITUTES, OR IS TO BE TAKEN AS CONSTITUTING, THE GIVING OF INVESTMENT ADVICE BY ANY OF THE RELEVANT PARTIES.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">9. ANY PROPOSAL TO PURCHASE THE COMPANY MADE IN DUE COURSE MUST BE IN ACCORDANCE WITH THE PROCEDURE DESCRIBED SEPARATELY IN THE LETTER FROM BENCHMARK ADDRESSED TO THE ADDRESSEE.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">10. ONLY THOSE PARTICULAR REPRESENTATIONS AND WARRANTIES WHICH MAY BE MADE IN A SALE AND PURCHASE AGREEMENT (WHICH WILL NOT CONTAIN ANY REPRESENTATIONS OR WARRANTIES AS TO THIS IM) WHEN AND IF IT IS FINALLY EXECUTED, AND SUBJECT TO SUCH LIMITATIONS AND RESTRICTIONS AS MAY BE AGREED, SHALL HAVE ANY LEGAL EFFECT. ACCORDINGLY NO REPRESENTATIONS OR WARRANTIES ARE GIVEN IN, OR IN RESPECT OF, THIS IM OR ANY FURTHER INFORMATION SUPPLIED.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">11. THE DIRECTORS OF THE COMPANY WILL ACT AS A PRIMARY POINT OF CONTACT FOR INTERESTED PARTIES. UNLESS SPECIFICALLY AGREED IN WRITING, UNDER NO CIRCUMSTANCES SHOULD POTENTIAL INTERESTED PARTIES CONTACT OTHER INDIVIDUALS OR EMPLOYEES OF THE COMPANY, OR VISIT ANY SITES USED BY THE COMPANY.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">12. THIS IM SHOULD NOT BE CONSIDERED AS A RECOMMENDATION BY ANY OF THE RELEVANT PARTIES TO INVEST IN THE COMPANY, AND RECIPIENTS INTERESTED IN INVESTING IN THE COMPANY ARE RECOMMENDED TO SEEK THEIR OWN INDEPENDENT FINANCIAL, LEGAL AND OTHER ADVICE FROM PERSONS AUTHORISED AND SPECIALISING, AS NECESSARY, IN INVESTMENTS OF THE KIND IN QUESTION. RECIPIENTS SHOULD BE AWARE THAT ANY INVESTMENT ACTIVITY MAY EXPOSE THEM TO A RISK OF LOSING THE PROPERTY INVESTED.</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">&nbsp;</span></p><p style="text-align:justify;"><span style="background-color:transparent;color:#2B2B2B;">13. RECIPIENTS OF THIS IM IN JURISDICTIONS OUTSIDE THE UK SHOULD INFORM THEMSELVES ABOUT AND OBSERVE ALL APPLICABLE LEGAL REQUIREMENTS IN THEIR JURISDICTIONS. IN PARTICULAR, THE DISTRIBUTION OF THIS IM IN CERTAIN JURISDICTIONS MAY BE RESTRICTED BY LAW AND, ACCORDINGLY, RECIPIENTS REPRESENT THAT THEY ARE ABLE TO RECEIVE THIS IM WITHOUT CONTRAVENTION OF ANY UNFULFILLED REGISTRATION REQUIREMENTS OR OTHER LEGAL RESTRICTIONS IN THE JURISDICTION IN WHICH THEY RESIDE OR CONDUCT BUSINESS.&nbsp;</span></p></div></div>`
                },
                {
                    title: 'US Legal Disclaimer',
                    description: 'Templated US Legal Disclaimer Text',
                    data: `<p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;"><strong>LEGAL DISCLOSURES AND DISCLAIMERS CONCERNING FORWARD-LOOKING STATEMENTS AND OTHER MATTERS.&nbsp;</strong></span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">THIS CONFIDENTIAL INFORMATIONAL MEMORANDUM (THIS&nbsp;“<strong>MEMORANDUM</strong>”) CONTAINS THE PROPRIETARY INFORMATION OF [LEGAL NAMES OF ALL ENTITIES INCLUDED IN DEFINITION OF BUSINESS IN THE TERMS OF ENGAGEMENT]</span><span style="color:red;font-size:14px;">&nbsp;</span><span style="color:#0C0C0C;font-size:14px;">(THE&nbsp;“<strong>BUSINESS</strong>”), AND ITS DISCLOSURE IS MADE PURSUANT TO THE CONFIDENTIALITY OBLIGATIONS SET FORTH IN THE RELEVANT NDA OR CONFIDENTIALITY AGREEMENT.&nbsp;</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">THIS MEMORANDUM IS BEING PROVIDED FOR INFORMATION ONLY AND DOES NOT CONSTITUTE AN OFFER TO SELL OR SOLICITATION OF AN OFFER TO BUY SECURITIES IN ANY JURISDICTION. NO SECURITIES ARE BEING OFFERED HEREBY AND NO REPRESENTATION IS MADE REGARDING THE REGISTRATION OF ANY SECURITIES UNDER THE SECURITIES ACT OF 1933, AS AMENDED, OR THE SECURITIES LAWS OF ANY STATE OR FOREIGN JURISDICTION.</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">NO INFORMATION CONTAINED IN THIS MEMORANDUM SHOULD BE TAKEN AS CONSTITUTING AN OFFER OR INVITATION TO SUBSCRIBE FOR OR TO PURCHASE, SELL OR HOLD ANY INTEREST IN, OR GOODWILL OR ASSETS OF, THE BUSINESS OR ANY OTHER ENTITY. THE INFORMATION CONTAINED HEREIN IS SUBJECT TO UPDATING, AMENDMENT AND VERIFICATION. IT SHOULD NOT BE RELIED UPON BY ANY PERSONS FOR ANY PURPOSE.&nbsp;NEITHER THE RECEIPT OF THIS MEMORANDUM NOR ANY INFORMATION&nbsp;IN THIS MEMORANDUM OR IN THE MATERIALS REFERRED TO HEREIN CONSTITUTES OR IS INTENDED TO CONSTITUTE FINANCIAL, INVESTMENT, OR OTHER ADVICE BY THE BUSINESS, BY BENCHMARK INTERNATIONAL, OR BY THEIR RESPECTIVE OWNERS, MANAGEMENT, EMPLOYEES. OR AGENTS. YOU SHOULD NOT ACT UPON ANY INFORMATION CONTAINED IN THIS MEMORANDUM OR IN THE MATERIALS REFERRED TO HEREIN WITHOUT FIRST CONSULTING FINANCIAL, LEGAL AND OTHER PROFESSIONAL ADVISERS.</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">EACH RECIPIENT, BY ACCEPTING DELIVERY OF THIS MEMORANDUM, AGREES TO HOLD THE BUSINESS, AND ITS OWNERS, MANAGEMENT, EMPLOYEES, AND AGENTS, TOGETHER WITH BENCHMARK INTERNATIONAL AND ITS OFFICERS, MANAGEMENT, EMPLOYEES, AND AGENTS, HARMLESS AGAINST ANY CLAIMS, COSTS, EXPENSES OR DAMAGES THEY MAY SUFFER AS A RESULT OF THEIR RELIANCE UPON THE CONTENTS OF THIS MEMORANDUM. REPRODUCTION OF THIS MEMORANDUM IS PROHIBITED.&nbsp;</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">NO PART OF THE CONTENTS OF THIS MEMORANDUM HAS BEEN APPROVED, DISAPPROVED, OR RECOMMENDED BY THE SECURITIES AND EXCHANGE COMMISSION OR ANY STATE SECURITIES COMMISSION. NOR HAVE ANY OF SUCH AUTHORITIES PASSED UPON THE ACCURACY OR ADEQUACY OF THIS MEMORANDUM. ANY REPRESENTATION TO THE CONTRARY IS A CRIMINAL OFFENSE.</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">IN ADDITION TO THE HISTORICAL INFORMATION CONTAINED HEREIN, THIS MEMORANDUM CONTAINS FORWARD-LOOKING STATEMENTS THAT INVOLVE RISK AND UNCERTAINTIES. STATEMENTS CONTAINED IN THIS MEMORANDUM, INCLUDING, WITHOUT LIMITATION, STATEMENTS CONTAINING THE WORDS “BELIEVE,” “ARE OF THE OPINION,” “ANTICIPATE,” “ESTIMATE,” “EXPECT,” AND WORDS OF SIMILAR IMPORT, CONSTITUTE “FORWARD-LOOKING STATEMENTS<i>.”&nbsp;</i>THE INFORMATION CONTAINED HEREIN CONSTITUTING FORWARD-LOOKING STATEMENTS INCLUDES, BUT IS NOT LIMITED TO, THE (I) PROJECTED FINANCIAL PERFORMANCE OF THE BUSINESS; (II) THE EXPECTED DEVELOPMENT OF THE BUSINESS’ OPERATIONS, PROJECTS, AND JOINT VENTURES; (III) EXECUTION OF THE BUSINESS’ VISION AND GROWTH STRATEGY; (IV) COMPLETION OF THE BUSINESS’ PROJECTS THAT ARE CURRENTLY UNDERWAY, IN DEVELOPMENT OR OTHERWISE UNDER CONSIDERATION; AND (V) RENEWAL OF THE BUSINESS’ CURRENT CUSTOMER, SUPPLIER AND OTHER MATERIAL AGREEMENTS. FORWARD-LOOKING STATEMENTS ARE PROVIDED TO ALLOW RECIPIENTS THE OPPORTUNITY TO UNDERSTAND MANAGEMENT’S BELIEFS AND OPINIONS IN RESPECT OF THE FUTURE SO THAT THEY MAY USE SUCH BELIEFS AND OPINIONS AS ONE FACTOR IN EVALUATING AN INVESTMENT. FORWARD-LOOKING STATEMENTS ARE NECESSARILY BASED UPON CERTAIN ESTIMATES AND ASSUMPTIONS. ANY ASSUMPTIONS SHOULD NOT BE CONSTRUED TO BE INDICATIVE OF THE ACTUAL EVENTS THAT WILL OCCUR. ACTUAL EVENTS ARE DIFFICULT TO PREDICT AND MAY DEPEND UPON FACTORS THAT ARE BEYOND THE CONTROL OF THE BUSINESS AND ITS MANAGEMENT. CERTAIN ASSUMPTIONS HAVE BEEN MADE TO SIMPLIFY THE PRESENTATION AND, ACCORDINGLY, ACTUAL RESULTS MAY DIFFER, PERHAPS MATERIALLY, FROM THOSE PRESENTED. SOME IMPORTANT FACTORS THAT COULD CAUSE ACTUAL RESULTS TO DIFFER MATERIALLY FROM THOSE IN ANY FORWARD-LOOKING STATEMENTS INCLUDE, BUT ARE NOT LIMITED TO, THE FOLLOWING: FINANCIAL, MARKET, ECONOMIC, TECHNOLOGICAL, PERSONNEL, REGULATORY, OR LEGAL CONDITIONS OR CHANGES. RECIPIENTS ARE CAUTIONED NOT TO PLACE UNDUE RELIANCE ON FORWARD-LOOKING STATEMENTS. RECIPIENTS SHOULD CONDUCT THEIR OWN ANALYSIS, USING SUCH ASSUMPTIONS AS THEY DEEM APPROPRIATE, AND SHOULD FULLY CONSIDER OTHER AVAILABLE INFORMATION. NEITHER THE BUSINESS NOR BENCHMARK INTERNATIONAL UNDERTAKES ANY OBLIGATION TO UPDATE FORWARD-LOOKING STATEMENTS IF CIRCUMSTANCES OR MANAGEMENT’S ESTIMATES OR OPINIONS SHOULD CHANGE.&nbsp;</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">THIS MEMORANDUM IS BEING ISSUED BY THE BUSINESS WHO HAS AUTHORIZED ITS ISSUE. NOTICE IS GIVEN THAT:</span></p><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><ul style="list-style-type:disc;"><li><span style="color:#0C0C0C;font-size:14px;">THE INFORMATION RELATING TO THE BUSINESS CONTAINED HEREIN HAS BEEN PROVIDED BY THE BUSINESS. THIS INFORMATION HAS NOT BEEN INDEPENDENTLY VERIFIED BY BENCHMARK INTERNATIONAL OR ANY OTHER PARTY.</span></li></ul><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><ul style="list-style-type:disc;"><li><span style="color:#0C0C0C;font-size:14px;">THE BUSINESS DOES NOT UNDERTAKE TO ACCEPT THE HIGHEST, OR ANY, OFFER AND RESERVES THE RIGHT TO ACCEPT OR REJECT ANY OFFER FOR ANY REASON. THE BUSINESS RESERVES THE RIGHT TO NEGOTIATE WITH ONE OR MORE POTENTIAL PARTIES AT ANY TIME AND TO ENTER INTO A DEFINITIVE AGREEMENT FOR A TRANSACTION INVOLVING THE BUSINESS WITHOUT PRIOR NOTICE TO THE RECIPIENT. THE BUSINESS AND BENCHMARK INTERNATIONAL RESERVE THE RIGHT, WITHOUT PRIOR NOTICE OR ASSIGNING ANY REASON THEREFORE, AND AT ANY TIME, TO (1) TERMINATE FURTHER PARTICIPATION IN THE INVESTIGATION AND PROPOSED PROCESS BY ANY PARTY, (2) MODIFY THE DEADLINES OR PROCEDURES, IF ANY, SET FORTH HEREIN OR ELSEWHERE WITHOUT OR (3) TERMINATE THE SALE PROCESS CONTEMPLATED HEREBY.&nbsp;</span></li></ul><p style="margin-left:.5in;"><span style="font-size:14px;">&nbsp;</span></p><ul style="list-style-type:disc;"><li><span style="color:#0C0C0C;font-size:14px;">THE BUSINESS RESERVES THE RIGHT TO TAKE ANY ACTION, WHETHER IN OR OUT OF (1) THE BUSINESS’ ORDINARY COURSE OF BUSINESS, OR (2) ANY PROCESS CONTEMPLATED BY THIS MEMORANDUM.</span></li></ul><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><ul style="list-style-type:disc;"><li><span style="color:#0C0C0C;font-size:14px;">ONLY THOSE PARTICULAR REPRESENTATIONS AND WARRANTIES WHICH MAY BE MADE THE BUSINESS OR ITS OWNERS IN A SALE AND PURCHASE AGREEMENT (WHICH WILL NOT CONTAIN ANY REPRESENTATIONS OR WARRANTIES AS TO THIS MEMORANDUM) WHEN AND IF SUCH AGREEMENT IS FINALLY EXECUTED, AND SUBJECT TO SUCH LIMITATIONS AND RESTRICTIONS AS MAY BE AGREED THEREIN, SHALL HAVE ANY LEGAL EFFECT. ACCORDINGLY, NO REPRESENTATIONS OR WARRANTIES ARE GIVEN BY ANY OF BENCHMARK INTERNATIONAL, THE BUSINESS, OR OWNER(S) OF THE BUSINESS IN, OR IN RESPECT OF, THIS MEMORANDUM OR ANY FURTHER INFORMATION SUPPLIED.&nbsp;</span></li></ul><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><ul style="list-style-type:disc;"><li><span style="color:#0C0C0C;font-size:14px;">EITHER BENCHMARK INTERNATIONAL OR THE OWNER(S) OF THE BUSINESS DESIGNATED IN THIS MEMORANDUM WILL ACT AS A PRIMARY POINT OF CONTACT FOR THE RECIPIENT THROUGHOUT THE SALE PROCESS UNLESS SPECIFICALLY AGREED TO IN WRITING. UNDER NO CIRCUMSTANCES SHOULD RECIPIENT CONTACT OTHER EMPLOYEES OF THE BUSINESS OR VISIT ANY SITES USED BY THE BUSINESS.</span></li></ul><p style="margin-left:0in;"><span style="font-size:14px;">&nbsp;</span></p><p style="margin-left:0in;"><span style="color:#0C0C0C;font-size:14px;">RECIPIENTS OF THIS MEMORANDUM IN JURISDICTIONS OUTSIDE THE UNITED STATES SHOULD INFORM THEMSELVES ABOUT AND OBSERVE ALL APPLICABLE LEGAL REQUIREMENTS IN THEIR JURISDICTIONS. IN PARTICULAR, THE DISTRIBUTION OF THIS MEMORANDUM IN CERTAIN JURISDICTIONS MAY BE RESTRICTED BY LAW AND, ACCORDINGLY, RECIPIENTS REPRESENT THAT THEY ARE ABLE TO RECEIVE THIS MEMORANDUM WITHOUT CONTRAVENTION OF ANY UNFULFILLED REGISTRATION REQUIREMENTS OR OTHER LEGAL RESTRICTIONS IN THE JURISDICTION IN WHICH THEY RESIDE OR CONDUCT BUSINESS.</span></p>`
                },
                {
                    title: 'Entity Registration (2 Column)',
                    description: 'Two column table at 50% width for Entity Registration Details',
                    data: `<figure class="table" style="width:70%;"><table style="background-color:rgb(242,242,242);border:2px solid rgb(177,143,106);"><tbody><tr><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:50%;" colspan="2"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>ENTITY REGISTRATION</strong></span></td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Legal Name</td><td style="padding:.15rem;text-align:center;width:50%;">FROM TAX RETURN</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">FEIN/EIN</td><td style="padding:.15rem;text-align:center;">FROM TAX RETURN</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Incorporation Date / Date Business Started</td><td style="padding:.15rem;text-align:center;">FROM TAX RETURN</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Company Structure</td><td style="padding:.15rem;text-align:center;">[STATE] [BUSINESS STRUCTURE]</td></tr><tr><td style="border-right:2px solid rgb(162,147,133);padding:.15rem;width:50%;">Tax Structure</td><td style="padding:.15rem;text-align:center;">TAX FORM NUMBER</td></tr></tbody></table></figure>`
                },
                {
                    title: 'Entity Registration (4 Column)',
                    description: 'Four column, two row table set at a table width of 80% for Entity Registration Details',
                    data:`<p>&nbsp;</p><figure class="table" style="width:80%;"><table style="background-color:rgb(242,242,242);"><tbody><tr><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>LEGAL NAME</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>FEI/EIN NUMBER</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>DATE ESTABLISHED</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:25%;"><span style="color:hsl(0,0%,100%);font-size:18px;"><strong>OWNER</strong></span></td></tr><tr><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td><td style="padding:.5rem;text-align:center;width:25%;">&nbsp;</td></tr></tbody></table></figure>`
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
                    data: `<p>&nbsp;</p><figure class="table" style="width:100%;"><table style="border:2px solid rgb(177,143,106);"><tbody><tr><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:28%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>ADDRESS</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>SQ. FT.</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>MONTHLY RENT</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>LEASE TERMS</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:18%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>OWNER</strong></span></td></tr><tr><td style="text-align:center;width:28%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td></tr><tr><td style="text-align:center;width:28%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td><td style="text-align:center;width:18%;">&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p>`
                },
                {
                    title: 'Table - Product and GP Margin Display',
                    description: 'Two column table to display Products and the Related GP Margins',
                    data: `<p>&nbsp;</p><figure class="table" style="width:100%;"><table style="background-color:rgb(242,242,242);"><tbody><tr><td style="background-color:rgb(177,143,106);padding:.2rem;vertical-align:top;width:50%;"><span style="color:hsl(0,0%,100%);"><strong>Product / Service</strong></span></td><td style="background-color:rgb(177,143,106);padding:.2rem;text-align:right;vertical-align:top;width:50%;"><span style="color:hsl(0,0%,100%);"><strong>GP Margin</strong></span></td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr><tr><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td><td style="padding:.2rem;vertical-align:top;width:50%;">&nbsp;</td></tr></tbody></table></figure><p>&nbsp;</p>`
                },
                {
                    title: 'Table - Shareholder Table',
                    description: 'A Three colum shaded table with colored header - For shareholder listing',
                    data: `<figure class="table" style="width:100%;"><table style="background-color:rgb(242,242,242);border:2px solid rgb(177,143,106);"><tbody><tr><td style="background-color:rgb(177,143,106);padding:.5rem;width:33%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>SHAREHOLDER</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:33%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>% OWNED</strong></span></td><td style="background-color:rgb(177,143,106);padding:.5rem;text-align:center;width:33%;"><span style="color:hsl(0,0%,100%);font-size:20px;"><strong>POSITION</strong></span></td></tr><tr><td style="padding:.3rem;width:33%;">Insert Text</td><td style="padding:.3rem;text-align:center;width:33%;">X%</td><td style="padding:.3rem;text-align:center;width:33%;">Insert Text</td></tr><tr><td style="padding:.3rem;width:33%;">Insert Text</td><td style="padding:.3rem;text-align:center;width:33%;">X%</td><td style="padding:.3rem;text-align:center;width:33%;">Insert Text</td></tr><tr><td style="padding:.3rem;width:33%;">Insert Text</td><td style="padding:.3rem;text-align:center;width:33%;">X%</td><td style="padding:.3rem;text-align:center;width:33%;">Insert Text</td></tr></tbody></table></figure>`
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
        }
    }
});
const editorContent = computed( () => {
    console.log('editorContent computed called.');
    return (content.value?.Body__c === undefined) ? '' : content.value.Body__c;
})
const editor = ref({});
const content = ref({});
const isLayoutReady = ref(false);

/*
BEGIN: function definitions
*/
const obtainContent = async (recordIdVal) => {
    try {
        var queryUrl = `${props.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumContent__c/${recordIdVal}`;
        queryUrl += `?fields=Id,Name,CurrencyIsoCode,Body__c,Parent__c,Parent__r.Name,Order__c,DisplayRecordName__c,ActiveComments__c,ExternalComments__c`;
        let contentResponse = await axios.get(queryUrl, {
            headers:{'authorization':`Bearer ${props.accessToken}`},
            responseType:'json'
        });
        content.value = contentResponse.data;
        console.log('Content obtained: %s', JSON.stringify(content.value, null, "\t"));
    } catch (e) {
        console.log('Error getting content: %s', JSON.stringify(e, null, "\t"));
    }
}

function editorReady(editorInstance) {
    console.log('Editor is ready to use!');
    editorInstance.setData(content.value.Body__c);
}
/*
END: function definitions
*/

/*
BEGIN: lifecycle hooks
*/
onBeforeMount( async () => {
    editor.value = ClassicEditor;
    await obtainContent(props.recordId);
});
onMounted(() => {
    isLayoutReady.value = true;
});
watch( () => props.recordId, async (newVal) => {
    // isLayoutReady.value = false;
    await obtainContent(newVal);
    // isLayoutReady.value = true;
});
/*
END: lifecycle hooks
*/

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
                <h2 class="slds-text-heading_large">{{ modalText }} <span v-if="autoSavePending"> Content Changed... Please do not navigate away until saving is complete.</span></h2>
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
                                <span v-if="displayPendingSave" class="slds-text-color_destructive slds-page-header__title">Saving - Please do not navigate away...</span>
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

    <!-- BEGIN: Editor -->
    <div class="main-container">
		<div class="editor-container editor-container_classic-editor editor-container_include-style" ref="editorContainerElement">
			<div class="editor-container__editor">
				<div ref="editorElement">
					<ckeditor v-if="isLayoutReady" :editor="editor" :config="config" :modelValue="editorContent" v-on:ready="editorReady" />
				</div>
			</div>
		</div>
        <div class="revision-history" ref="editorRevisionHistoryElement">
			<div class="revision-history__wrapper">
				<div class="revision-history__editor" ref="editorRevisionHistoryEditorElement"></div>
				<div class="revision-history__sidebar" ref="editorRevisionHistorySidebarElement"></div>
			</div>
		</div>
	</div>
    <!-- END: Editor -->

    <!-- BEGIN : Comment Information-->
    <div v-if="hasExternalComments" class="slds-card slds-var-m-top_large">
        <div class="slds-card__header slds-grid">
            <div class="slds-media slds-media_center slds-has-flexi-truncate">
                <div class="slds-media__figure">

                </div>
                <div class="slds-media__body">
                    <h2 class="slds-card__header-title">
                        <span>Seller Comments</span>
                    </h2>
                </div>
            </div>
        </div>
        <div class="slds-grid slds-wrap">
            <div class="slds-col slds-size_1-of-1">
                <CommentList v-bind:comments="commentArray"></CommentList>
            </div>
        </div>
    </div>
    <!-- END : Comment Information-->
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
    #editorRevisionEditorTest {
        min-height: 100px;
        border: solid 2px rgb(255,0,0);
    }
    #editorRevisionSidebarTest {
        min-height: 100px;
        border: solid 2px rgb(0,0,255);
    }
</style>