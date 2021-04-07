/**
 * @typedef Tag
 * @property {string} text - The label of the tag
 * @property {number} count - The number of times this tag has been used.
 * @property {number} updated - The timestamp when this tag was last used.
 */

/**
 * Service for fetching tag suggestions and storing data to generate them.
 *
 * The `tags` service stores metadata about recently used tags to local storage
 * and provides a `filter` method to fetch tags matching a query, ranked based
 * on frequency of usage.
 */
// @inject
export default function tags(localStorage) {
  const TAGS_LIST_KEY = 'hypothesis.user.tags.list';
  const TAGS_MAP_KEY = 'hypothesis.user.tags.map';

  /**
   * Convert from CSV to JSON tags and tooltips list.
   *
   * @param {string} query
   * @param {number|null} limit - Optional limit of the results.
   * @return {Tag[]} List of matching tags
   */
  // function csvToJson(str, headerList, quotechar = '"', delimiter = ',') => {
  //   const cutlast = (_, i, a) => i < a.length - 1;
  //   // const regex = /(?:[\t ]?)+("+)?(.*?)\1(?:[\t ]?)+(?:,|$)/gm; // no variable chars
  //   const regex = new RegExp(`(?:[\\t ]?)+(${quotechar}+)?(.*?)\\1(?:[\\t ]?)+(?:${delimiter}|$)`, 'gm');
  //   const lines = str.split('\n');
  //   const headers = headerList || lines.splice(0, 1)[0].match(regex).filter(cutlast);

  //   const list = [];

  //   for (const line of lines) {
  //     const val = {};
  //     for (const [i, m] of [...line.matchAll(regex)].filter(cutlast).entries()) {
  //       // Attempt to convert to Number if possible, also use null if blank
  //       val[headers[i]] = (m[2].length > 0) ? Number(m[2]) || m[2] : null;
  //     }
  //     list.push(val);
  //   }

  //   return list;
  // }

  function getTagMap(){
     return localStorage.getObject(TAGS_MAP_KEY);
  }

  /**
   * Return a list of tag suggestions matching `query`.
   *
   * @param {string} query
   * @param {number|null} limit - Optional limit of the results.
   * @return {Tag[]} List of matching tags
   */
  function filter(query, limit = null) {
    const savedTags = localStorage.getObject(TAGS_LIST_KEY) || [];
    let resultCount = 0;
    // query will match tag if:
    // * tag starts with query (e.g. tag "banana" matches query "ban"), OR
    // * any word in the tag starts with query
    //   (e.g. tag "pink banana" matches query "ban"), OR
    // * tag has substring query occurring after a non-word character
    //   (e.g. tag "pink!banana" matches query "ban")
    let regex = new RegExp('(\\W|\\b)' + query, 'i');
    return savedTags.filter(tag => {
      if (tag.match(regex)) {
        if (limit === null || resultCount < limit) {
          // limit allows a subset of the results
          // See https://github.com/hypothesis/client/issues/1606
          ++resultCount;
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Replace the list of stored tag suggestions based on the tags that a user has
   * entered for a given annotation.
   *
   * @param {Tag[]} tags - List of tags.
   */
  function replace(tags) {
    // Update the stored (tag, frequency) map.
    const savedTags = {};
    tags.forEach(tag => {
      if (savedTags[tag.text]) {
        savedTags[tag.text].count += 1;
        savedTags[tag.text].updated = Date.now();
      } else {
        if (tag.hasOwnProperty('tooltip')){
          savedTags[tag.text] = {
            text: tag.text,
            tooltip: tag.tooltip,
            count: 1,
            updated: Date.now(),
          };
        }
        else{
           savedTags[tag.text] = {
            text: tag.text,
            tooltip: tag.text,
            count: 1,
            updated: Date.now(),
          };         
        }
      }
    });
    localStorage.setObject(TAGS_MAP_KEY, savedTags);

    // Sort tag suggestions by frequency.
    const tagsList = Object.keys(savedTags).sort((t1, t2) => {
      if (savedTags[t1].count !== savedTags[t2].count) {
        return savedTags[t2].count - savedTags[t1].count;
      }
      return t1.localeCompare(t2);
    });
    localStorage.setObject(TAGS_LIST_KEY, tagsList);
  }


  /**
   * Update the list of stored tag suggestions based on the tags that a user has
   * entered for a given annotation.
   *
   * @param {Tag[]} tags - List of tags.
   */
  function store(tags) {
    // Update the stored (tag, frequency) map.
    const savedTags = localStorage.getObject(TAGS_MAP_KEY) || {};
    tags.forEach(tag => {
      if (savedTags[tag.text]) {
        savedTags[tag.text].count += 1;
        savedTags[tag.text].updated = Date.now();
      } else {
        if (tag.hasOwnProperty('tooltip')){
          savedTags[tag.text] = {
            text: tag.text,
            tooltip: tag.tooltip,
            count: 1,
            updated: Date.now(),
          };
        }
        else{
           savedTags[tag.text] = {
            text: tag.text,
            tooltip: tag.text,
            count: 1,
            updated: Date.now(),
          };         
        }
      }
    });
    localStorage.setObject(TAGS_MAP_KEY, savedTags);

    // Sort tag suggestions by frequency.
    const tagsList = Object.keys(savedTags).sort((t1, t2) => {
      if (savedTags[t1].count !== savedTags[t2].count) {
        return savedTags[t2].count - savedTags[t1].count;
      }
      return t1.localeCompare(t2);
    });
    localStorage.setObject(TAGS_LIST_KEY, tagsList);
  }

  return {
    filter,
    store,
    replace,
    getTagMap,
  };
}
