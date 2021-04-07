import { createElement, Fragment } from 'preact';
import { useState } from 'preact/hooks'
import propTypes from 'prop-types';

import { useStoreProxy } from '../store/use-store';
import uiConstants from '../ui-constants';
import { pageSharingLink } from '../util/annotation-sharing';
import { withServices } from '../util/service-context';
import { notNull } from '../util/typing';

import Button from './button';
import SidebarPanel from './sidebar-panel';
import Spinner from './spinner';

/**
 * @typedef CustomTagsPanel
 * @prop {Object} toastMessenger - Injected service
 * @prop {Object} tags - Injected service
 */

/**
 * A panel for uploading custom tags from a link containing a CSV file
 *
 * @param {CustomTagsPanel} props
 */
function CustomTagsPanel({ toastMessenger, tags: tagsService }) {
    const store = useStoreProxy();
    const mainFrame = store.mainFrame();
    const focusedGroup = store.focusedGroup();
    const panelTitle = 'Upload custom tags';
    const [inputValue, setInputValue] = useState('');
    const [replaceTags, set_is_checked]= useState(false);
    const papa = require('papaparse');
    // To be able to concoct a sharing link, a focused group and frame need to
    // be available
    const sharingReady = focusedGroup && mainFrame;

    const shareURI =
        sharingReady &&
        pageSharingLink(notNull(mainFrame).uri, notNull(focusedGroup).id);

    const fetchSugStore = async (link) => {
        console.log("store");
        console.log("val: ", replaceTags);
        const isCsvFile = link.endsWith('.csv');
        var tagTooltipMap = [];

        papa.parse(link, {
            download: true,
            complete: function(results, link) {
                console.log('papa complete: ', results, link); 
                if (isCsvFile){
                    var numRows = results.data.length
                    if (numRows > 0){
                        var numColumns = results.data[0].length;
                        if (numColumns > 1){
                            var startRow = 0;
                            if (results.data[0][0] == "text" || results.data[0][1] == "tooltip"){
                                startRow = 1;
                            }
                            for (var i = startRow; i < numRows; i++) {
                                if (results.data[i].length > 1){
                                    console.log(i, " : ", results.data[i]);
                                    tagTooltipMap.push({text: results.data[i][0], tooltip: results.data[i][1]});
                                }
                            }
                        }
                        else{
                            if (numColumns == 1){
                                var startRow2 = 0;
                                if (results.data[0][0] == "text"){
                                    startRow2 = 1;
                                }                               
                                for (var j = startRow2; j < numRows; j++) {
                                    if (results.data[j].length == 1){
                                        console.log(j, " : ", results.data[j]);
                                        tagTooltipMap.push({text: results.data[j][0]});
                                    }
                                    tagTooltipMap.push({text: results.data[j][0]});
                                }
                            }
                            else{
                                console.log("Error cols: CSV file is empty or unreadable.")
                            }
                        }

                    }
                    else{
                        console.log("Error rows: CSV file is empty or unreadable.")
                    }
                    console.log('tagTooltipMap: ', tagTooltipMap);
                    tagsService.store(tagTooltipMap);     
                    toastMessenger.success('Added the custom tags from the link');
                } 
                else {
                    toastMessenger.error('Unable to fetch the link');
                }
            }
        });
    };

    const fetchSugReplace = async (link) => {
        console.log("replace");
        console.log("val: ", replaceTags);
        const isCsvFile = link.endsWith('.csv');
        var tagTooltipMap = [];

        papa.parse(link, {
            download: true,
            complete: function(results, link) {
                console.log('papa complete: ', results, link); 
                if (isCsvFile){
                    var numRows = results.data.length
                    if (numRows > 0){
                        var numColumns = results.data[0].length;
                        if (numColumns > 1){
                            var startRow = 0;
                            if (results.data[0][0] == "text" || results.data[0][1] == "tooltip"){
                                startRow = 1;
                            }
                            for (var i = startRow; i < numRows; i++) {
                                if (results.data[i].length > 1){
                                    console.log(i, " : ", results.data[i]);
                                    tagTooltipMap.push({text: results.data[i][0], tooltip: results.data[i][1]});
                                }
                            }
                        }
                        else{
                            if (numColumns == 1){
                                var startRow2 = 0;
                                if (results.data[0][0] == "text"){
                                    startRow2 = 1;
                                }                               
                                for (var j = startRow2; j < numRows; j++) {
                                    if (results.data[j].length == 1){
                                        console.log(j, " : ", results.data[j]);
                                        tagTooltipMap.push({text: results.data[j][0]});
                                    }
                                    tagTooltipMap.push({text: results.data[j][0]});
                                }
                            }
                            else{
                                console.log("Error cols: CSV file is empty or unreadable.")
                            }
                        }

                    }
                    else{
                        console.log("Error rows: CSV file is empty or unreadable.")
                    }
                    console.log('tagTooltipMap: ', tagTooltipMap);
                    tagsService.replace(tagTooltipMap);   
                    toastMessenger.success('Replaced existing tags with those from the link');
                } 
                else {
                    toastMessenger.error('Unable to fetch the link');
                }
            }
        });
    };

    const uploadTagsReplace = (e) => {
        //console.log("file: ",e.target.files[0]);
        const isCsvFile = e.target.files[0].name.endsWith('.csv');
        var tagTooltipMap = [];
        papa.parse(e.target.files[0], {
            complete: function(results, fileDataURL) {
                console.log("results: ", results);
                if (isCsvFile){
                    var numRows = results.data.length
                    if (numRows > 0){
                        var numColumns = results.data[0].length;
                        if (numColumns > 1){
                            var startRow = 0;
                            if (results.data[0][0] == "text" || results.data[0][1] == "tooltip"){
                                startRow = 1;
                            }
                            for (var i = startRow; i < numRows; i++) {
                                if (results.data[i].length > 1){
                                    console.log(i, " : ", results.data[i]);
                                    tagTooltipMap.push({text: results.data[i][0], tooltip: results.data[i][1]});
                                }
                            }
                        }
                        else{
                            if (numColumns == 1){
                                var startRow2 = 0;
                                if (results.data[0][0] == "text"){
                                    startRow2 = 1;
                                }                               
                                for (var j = startRow2; j < numRows; j++) {
                                    if (results.data[j].length == 1){
                                        console.log(j, " : ", results.data[j]);
                                        tagTooltipMap.push({text: results.data[j][0]});
                                    }
                                    tagTooltipMap.push({text: results.data[j][0]});
                                }
                            }
                            else{
                                console.log("Error cols: CSV file is empty or unreadable.")
                            }
                        }

                    }
                    else{
                        console.log("Error rows: CSV file is empty or unreadable.")
                    }
                    console.log('tagTooltipMap: ', tagTooltipMap);
                    tagsService.replace(tagTooltipMap);   
                    toastMessenger.success('Replaced existing tags with those from the file');
                } 
                else {
                    toastMessenger.error('Unable to load the file');
                }
            }
        });
    };

    const uploadTagsStore = (e) => {
        const isCsvFile = e.target.files[0].name.endsWith('.csv');
        var tagTooltipMap = [];
        papa.parse(e.target.files[0], {
            complete: function(results, fileDataURL) {
                console.log("results: ", results);
                if (isCsvFile){
                    var numRows = results.data.length
                    if (numRows > 0){
                        var numColumns = results.data[0].length;
                        if (numColumns > 1){
                            var startRow = 0;
                            if (results.data[0][0] == "text" || results.data[0][1] == "tooltip"){
                                startRow = 1;
                            }
                            for (var i = startRow; i < numRows; i++) {
                                if (results.data[i].length > 1){
                                    console.log(i, " : ", results.data[i]);
                                    tagTooltipMap.push({text: results.data[i][0], tooltip: results.data[i][1]});
                                }
                            }
                        }
                        else{
                            if (numColumns == 1){
                                var startRow2 = 0;
                                if (results.data[0][0] == "text"){
                                    startRow2 = 1;
                                }                               
                                for (var j = startRow2; j < numRows; j++) {
                                    if (results.data[j].length == 1){
                                        console.log(j, " : ", results.data[j]);
                                        tagTooltipMap.push({text: results.data[j][0]});
                                    }
                                    tagTooltipMap.push({text: results.data[j][0]});
                                }
                            }
                            else{
                                console.log("Error cols: CSV file is empty or unreadable.")
                            }
                        }

                    }
                    else{
                        console.log("Error rows: CSV file is empty or unreadable.")
                    }
                    console.log('tagTooltipMap: ', tagTooltipMap);
                    tagsService.store(tagTooltipMap);   
                    toastMessenger.success('Added tags from the file');
                } 
                else {
                    toastMessenger.error('Unable to load the file');
                }
            }
        });
    };

    return (
        <SidebarPanel
            title={panelTitle}
            panelName={uiConstants.CUSTOM_TAG_PANEL}
        >
            {!sharingReady && (
                <div className="share-annotations-panel__spinner">
                    <Spinner />
                </div>
            )}
            {sharingReady && (
                <div className="share-annotations-panel">
                    {shareURI ? (
                        <Fragment>
                            <div className="share-annotations-panel__intro">
                                <p>Paste the link to a CSV file containing custom tags:</p>
                            </div>
                            <div className="u-layout-row">
                                <input
                                    aria-label="Use this URL to share these annotations"
                                    className="share-annotations-panel__form-input"
                                    type="text"
                                    value={inputValue}
                                    // @ts-ignore
                                    onChange={e => setInputValue(e.target.value)}
                                />

                                <Button
                                    icon="add"
                                    onClick={replaceTags === true ? () => fetchSugReplace(inputValue) : () => fetchSugStore(inputValue)}
                                    title="Add tags"
                                    className="share-annotations-panel__icon-button"
                                />
                            </div>
                            <div className="share-annotations-panel__intro">
                                    <p>Replace existing tags?&nbsp;&nbsp;&nbsp;
                                    <input
                                        checked={replaceTags}
                                        onChange={() => set_is_checked(!replaceTags)}
                                        aria-label="Replace existing tags?"
                                        title="Replace existing tags?"
                                        type="checkbox"
                                        // onChange={e => setReplaceValue(e.target.value)}
                                    /> 
                                    </p>
                            </div>
                            <div className="share-annotations-panel__intro">
                                <p>Upload custom tags from local CSV file:</p>
                            </div>
                            <div className="share-annotations-panel__intro">
                                <input 
                                    type="file" 
                                    className="share-annotations-panel__form-input" 
                                    onChange={replaceTags === true ? e => uploadTagsReplace(e) : e => uploadTagsStore(e)} 
                                />
                            </div>
                        </Fragment>
                    ) : (
                        <p>
                            These annotations cannot be shared because this document is not
                            available on the web.
                        </p>
                    )}
                </div>
            )}
        </SidebarPanel>
    );
}

CustomTagsPanel.propTypes = {
    analytics: propTypes.object.isRequired,
    toastMessenger: propTypes.object.isRequired,
    tags: propTypes.object.isRequired,
};

CustomTagsPanel.injectedProps = ['analytics', 'toastMessenger', 'tags'];

export default withServices(CustomTagsPanel);
