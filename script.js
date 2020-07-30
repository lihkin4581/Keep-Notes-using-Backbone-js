$(function() {

    $("#datepicker-1").datepicker();

    var Note = Backbone.Model.extend({

        defaults: {

            title: '',
            description: '',
            postedDate: ''

        }

    });

    var NoteCollection = Backbone.Collection.extend({

        model: Note,

    });

    // Different views for creation, searching and displaying the notes to the html


    //Create new note into the collection
    var NewNoteView = Backbone.View.extend({

        el: '#templateLoad',

        template: _.template($('#newNoteTemplate').html()),

        initialize: function() {

            this.$el.html(this.template()); //render the template to the el

        },

        events: {

            'submit': 'createNote',
            'click #homeButton': 'homeRoute'

        },

        createNote: function(event) {

            // Prevent submiting the page
            event.preventDefault();

            //formatting date to MM/DD/YYYY to match with Jquery datepicker
            var date = new Date();
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            var yyyy = date.getFullYear();

            if (dd < 10) {

                dd = '0' + dd;

            }

            if (mm < 10) {

                mm = '0' + mm;

            }
            var note = new Note({

                'title': this.$el.find('#new-title').val(),
                'description': this.$el.find('#new-description').val(),
                'postedDate': mm + '/' + dd + '/' + yyyy

            });

            //Duplicate entry automatically created
            this.collection.add(note);
            console.log(note);
            router.navigate('', { trigger: true });

        },
        homeRoute: function() {

            router.navigate('', { trigger: true });

        }

    });


    //load each model data's to the template
    var NoteItemView = Backbone.View.extend({

        template: _.template($('#noteItemTemplate').html()),

        events: {

            'dblclick #title': 'editNote',
            'dblclick #description': 'editNote',
            'click .edit-note': 'editNote',
            'click .delete-note': 'deleteNote',
            'click .update-note': 'updateNote',
            'click .cancel-note': 'cancelNote'

        },

        editNote: function() {

            this.$('.edit-note').hide();
            this.$('.delete-note').hide();
            this.$('.update-note').show();
            this.$('.cancel-note').show();

            this.$("#title").html('<input type="text" class="form-control col-6" id="title-update" value="' + this.model.attributes.title + '" autocomplete="off" required/>');
            this.$("#description").html('<textarea class="form-control col-12" id="description-update" value="' + this.model.attributes.description + '" autocomplete="off" required>' + this.model.attributes.description + '</textarea>');

        },

        //update note in the collection
        updateNote: function() {

            var new_title = $('#title-update').val();
            var new_description = $('#description-update').val();

            if (!new_title) { //check if title tag is null on updation
                alert("Enter the title");
                $('#title-update').val(this.model.attributes.title)

            } else {

                if (!new_description) { //check if description tag is null on updation

                    alert("Enter description")
                    $('#description-update').val(this.model.attributes.description)

                } else {

                    var date = new Date();
                    var dd = date.getDate();
                    var mm = date.getMonth() + 1;
                    var yyyy = date.getFullYear();

                    if (dd < 10) {

                        dd = '0' + dd;

                    }

                    if (mm < 10) {

                        mm = '0' + mm;

                    }

                    this.model.set({ 'title': new_title, 'description': new_description, 'postedDate': mm + '/' + dd + '/' + yyyy });
                }

            }

        },

        //delete note from the collection
        deleteNote: function() {

            var confirmation = confirm('Are you sure you want to delete this note?');

            if (confirmation) {

                this.model.destroy();

            }
        },

        remove: function() {

            this.$el.remove();

        },

        cancelNote: function() {

            this.render();

        },

        initialize: function() {

            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);

            this.render();
        },

        render: function() {

            this.$el.html(this.template(this.model.attributes)); //render and pass model attributes to the template

        }

    });

    //view for displaying each notes on creation to the template
    var NoteListView = Backbone.View.extend({

        className: 'row',

        initialize: function() {

            this.collection.on('add', this.addNote, this);

        },

        addNote: function(note) {

            var noteView = new NoteItemView({ model: note }); //add a single model

            this.$el.append(noteView.el);

        },

        render: function() {

            this.collection.each(this.addNote, this);
            // looping for each notes
            return this;

        }

    });


    //view for searching note based on title and date
    var SearchItemView = Backbone.View.extend({

        el: '#search',

        events: {

            'keyup #searchInput': 'searchNoteByTitle',
            'change #searchInput': 'searchNoteByTitle',
            'select #searchInput': 'searchNoteByTitle',
            'change #datepicker-1': 'searchNoteByDate',
            'keyup #datepicker-1': 'searchNoteByDate'

        },

        //Search note based on date
        searchNoteByDate: function() {

            $('#searchInput').val('');

            var dateSearch = $('#datepicker-1').val();

            if (dateSearch != '') {

                var searchNotes = new NoteCollection(this.collection.where({ postedDate: dateSearch }))

                var noteList = new NoteListView({ collection: searchNotes });

                $('#templateLoad').html(noteList.render().el);

            } else {

                var noteList = new NoteListView({ collection: this.collection });

                $('#templateLoad').html(noteList.render().el);

            }

        },

        //Search note based on title
        searchNoteByTitle: function() {

            $('#datepicker-1').val('');

            var titles = [];

            this.collection.each(function(note) {

                titles.push(note.toJSON().title);

            });

            $('#searchInput').autocomplete({

                source: titles,

            });

            var titleSearch = $('#searchInput').val();

            if (titleSearch != '') {

                var searchNotes = new NoteCollection(this.collection.where({ title: titleSearch }));

                var noteList = new NoteListView({ collection: searchNotes });

                $('#templateLoad').html(noteList.render().el);

            } else {

                var noteList = new NoteListView({ collection: this.collection });

                $('#templateLoad').html(noteList.render().el);

            }

        }

    });


    //global initialisation of the collection
    var notes = new NoteCollection([
        { title: 'Match @5pm', description: 'Match on 1st August at Aspire', postedDate: '05/01/2020' },
        { title: 'Finish before deadline', description: 'Complete the project before 28th July', postedDate: '06/10/2020' },
        { title: 'Pick up', description: 'Pick up at 7pm', postedDate: '07/01/2020' },
        { title: 'Dinner', description: 'Make the dinner for today', postedDate: '07/24/2020' },
        { title: 'Hello', description: 'hello World', postedDate: '07/27/2020' }
    ]);

    var searchItemView = new SearchItemView({ collection: notes });

    //view for routing 
    var Router = Backbone.Router.extend({

        routes: {

            '': 'index',
            'new': 'newNoteForm'

        },

        index: function() {

            $('.form-inline').show();

            var noteList = new NoteListView({ collection: notes });

            $('#templateLoad').html(noteList.render().el);

        },

        newNoteForm: function() {

            $('.form-inline').hide(); //hide the search form on page load

            newNoteView.initialize();

        }

    });

    var newNoteView = new NewNoteView({ collection: notes });

    var router = new Router();

    Backbone.history.start();

});