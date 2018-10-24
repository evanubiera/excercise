export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.fetchData()
      //use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.getUniqueCategory.bind(this))
      .then(this.getEntryByCategory.bind(this))
      .then(this.renderEntryByCategory.bind(this))
      .then(this.render.bind(this));

    console.log('Widget Instance Created');
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //ajax the data and resolve the promise when it comes back
      //get photos
      $.get('https://api.unsplash.com/search/photos?query=minimalist&client_id=ab7a3fe95397f9c4435bc0b6bf1d6e8ebd0b1b11e5ea9c09d10cf5c85e3be0a0', resolve);
    });
  }

  setData(data) {
    //all cureent data in provided JSON
    this.data = data.results;
    console.log('Data fetched', this.data);
  }

  getEntryByCategory(category) {
    //to be called when a category is clicked on in the far left column
    var entriesByCategory = [];

    this.clearSelectedEntries();

    //console.log("category passed in:", category);

    this.data.forEach(function(element){ 
      var currentElem = element;

      //console.log("photo tags", currentElem.photo_tags);
      var found = currentElem.photo_tags.find(function(element) {
        var el = element.title.toLowerCase();

        if(category) {
          //console.log(category);
          return el == category;
        }
      });

      //add entry if a match is found
      if (found) {
        console.log("was found");
        entriesByCategory.push(element);
      }
    });
    console.log(entriesByCategory);
    this.currentEntries = entriesByCategory;
    this.renderEntryByCategory();
  }

  getSelectedEntry(entry) {
    var entryID = entry;

    let thumbnail = document.getElementById("thumbnail");
    let description = document.getElementById("description");
    let userName = document.getElementById("user-name");
    let userProfileUrl = document.getElementById("user-profile-url");
    let userLikes = document.getElementById("user-likes");
    let imgWidth = document.getElementById("img-width");
    let imgHeight = document.getElementById("img-height");

    this.clearSelectedEntry();

    var selectedEntry = this.data.find(function(element) {
      return element.id == entryID;
    });

    thumbnail.src = selectedEntry.urls.thumb;
    description.innerHTML = selectedEntry.description;    
    userName.innerHTML = selectedEntry.user.name;
    userProfileUrl.innerHTML = selectedEntry.user.portfolio_url;
    userLikes.innerHTML = selectedEntry.likes;
    imgWidth.innerHTML = selectedEntry.width;
    imgHeight.innerHTML = selectedEntry.height;

    this.selectedEntry = selectedEntry;
    console.log(this.selectedEntry);
  }

  renderEntryByCategory() { 

    this.clearSelectedEntries();
    var ul = this.selectedTagList;

    for(var i =0; i<this.currentEntries.length; i++) {
        var entryTitle = this.currentEntries[i].description;


        var entryID = this.currentEntries[i].id;
        //create span node to live within LI
        var entryContent = document.createElement('span');
        //adding data attr
        entryContent.setAttribute('data-entry-by-cat', entryID);

        //add class name
        //entryContent.className = '';
        entryContent.innerHTML = entryTitle;
        
        //create LI node
        var li = document.createElement('li');

        //give LI node some content
        li.appendChild(entryContent);
        
        //add it to the UL structure
        ul.appendChild(li);
    }
  }

  //get unique tags for listing purposes
  getUniqueCategory() {
    //itereate over list of entries using map
    //callback function makes array of unique tags based on the tag array
    //return newly created array

    var data = this.data;


    //parse out all tags
    var uniqueTags = data.reduce(function(prev, curr) {
      console.log("prev vs curr", prev, curr);
        return [...prev, ...curr.photo_tags];
    }, ''); 

    console.log("unique tags:", uniqueTags);
    //remove duplicates
    var dedupedTags = uniqueTags.filter(function(item, pos, self) {
      //console.log("item vs pos", item, pos);
      return self.indexOf(item) == pos;
    });

    //covert all entries to lower case    
    dedupedTags = dedupedTags.map(function(x){ console.log("while deduping:",x.title); return x.title.toLowerCase() });

    //return sorted array
    this.sortedTags = dedupedTags.sort();

    console.log("sorted", this.sortedTags);

  }

  getElements() {
    //find and store other elements you need
    this.tagList = this.config.element.querySelectorAll('.tag-list')[0];
    this.selectedTagList = this.config.element.querySelectorAll('.matching-items-list')[0];
    this.clear = this.config.element.querySelectorAll("#clear")[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener('click', this.tagListClicked.bind(this));
    this.selectedTagList.addEventListener('click', this.selectedEntryClicked.bind(this));
    this.clear.addEventListener('click', this.clearAll.bind(this));
    //bind the additional event listener for clicking on a series title
  }

  render() {
    const ul = this.tagList;
    //render the list of tags from this.data into this.tagList
    for(var i =0; i<this.sortedTags.length; i++) {
        //create span node to live within LI
        var categoryContent = document.createElement('span');
        //adding data attr
        //console.log("data-cat gonna get set to this:", this.sortedTags[i]);
        categoryContent.setAttribute('data-category', this.sortedTags[i]);

        //add class name
        categoryContent.className = 'tag is-link';
        //give it markup
        categoryContent.innerHTML = this.sortedTags[i];
        
        //create LI node
        var li = document.createElement('li');

        //give LI node some content
        li.appendChild(categoryContent);
        
        //add it to the UL structure
        ul.appendChild(li);
    }
  }

  clearAll() {
    this.clearTagsList();
    this.clearSelectedEntries();
    this.clearSelectedEntry();
  }

  clearTagsList() {
    var ul = this.tagList;

    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }

  clearSelectedEntries(){
    var ul = this.selectedTagList;

    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }

  clearSelectedEntry() {
    let thumbnail = document.getElementById("thumbnail");
    let description = document.getElementById("description");
    let userName = document.getElementById("user-name");
    let userProfileUrl = document.getElementById("user-profile-url");
    let userLikes = document.getElementById("user-likes");
    let imgWidth = document.getElementById("img-width");
    let imgHeight = document.getElementById("img-height");

    thumbnail.src = ''
    description.innerHTML = '';    
    userName.innerHTML = '';
    userProfileUrl.innerHTML = '';
    userLikes.innerHTML = '';
    imgWidth.innerHTML = '';
    imgHeight.innerHTML = '';
  }

  tagListClicked(event) {
    var category = event.target.getAttribute("data-category");

    this.getEntryByCategory(category);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }

  selectedEntryClicked(event) {
    var selectedEntry = event.target.getAttribute("data-entry-by-cat");

    this.getSelectedEntry(selectedEntry);
    //check to see if it was a tag that was clicked and render
    //the list of series that have the matching tags
  }
}
