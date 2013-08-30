define(['backbone'], function(Backbone) {

	var CollectionView = Backbone.CollectionView = Backbone.View.extend({
		initialize: function(options) {
			/**
			 * Options:
			 *	- el: html list
			 *	- collection
			 *	- itemData: function that intercepts the model rendering
			 *	- itemTemplate: template function used to render the book thumbnail.
			 *	- itemSelector: function that returns a selector used to find a specific item.
			 */

			_.bindAll(this,'_handleAdd','_handleReset','_handleRemove','_moment','retrieveElement');

			/**
			 * The $list within which the items should be rendered.
			 */
			this.$list = options.list || this.$el;

			this.itemData = options.itemData || this.itemData;
			this.itemTemplate = options.itemTemplate || this.itemTemplate;
			this.itemSelector = options.itemSelector || this.itemSelector;

			/**
			 * Bind methods.
			 */
			_.bindAll(this,'itemData','itemTemplate','itemSelector');

			// listen to events on the collection
			this.listenTo(this.collection, 'add', this._handleAdd)
				.listenTo(this.collection, 'remove', this._handleRemove)
				.listenTo(this.collection, 'reset', this._handleReset);

			// start things up.
			this._handleReset(this.collection, this.collection.models);
		},

		/**
		 * OVERWRITE METHODS
		 */

		/**
		 * moments
		 */
		beforeAdd: function(model, $el) { $el.css('opacity', 0); },
		afterAdd: function(model, $el) { return $el.animate({ opacity: 1 }); },
		beforeRemove: function(model, $el) { return $el.animate({ opacity: 0 }); },
		afterRemove: function(model) {},
		beforeReset: function(collection, $el) {},
		afterReset: function(collection, $el) {},
		beforeSort: function(collection, $el) {},
		afterSort: function(collection, $el) {},

		/**
		 * method returns data to be used in the template.
		 */
		itemData: function(model) {
			return model.attributes;
		},

		/**
		 * The templating function
		 */
		itemTemplate: function(data) {
			return '<li id="'+ data.id +'"> Item id: '+ data.id +'</li>';
		},

		/**
		 * method returns a selector used to find the html representation of a given model.
		 * within the $el of this list view.
		 */
		itemSelector: function(model) {
			return '#' + model.id;
		},


		/**
		 * Event handlers
		 */
		_handleAdd: function(model) {
				// get the data for the template rendering
				// if there is an itemData function set, use it. Otherwise just use the model's attributes.
			var itemData = (typeof this.itemData === 'function') ? this.itemData(model) : model.attributes,
				// promise based render thumbnail
				renderThumb = $.when(itemData).then(this.itemTemplate),
				_this = this;

			// wait for the thumbnail to be rendered to continue.
			renderThumb.then(function(thumbHtml) {

				var $thumb = $(thumbHtml);

				_this._moment('beforeAdd', [model, $thumb])
					.then(function() {
						// append
						$thumb.appendTo(_this.$list);

						// run after
						_this._moment('afterAdd', [model, $thumb]);
					});
			});
		},

		_handleReset: function(collection, models) {

			var _this = this;

			this._moment('beforeReset', [collection, this.$list])
				.then(function() {
					// remove all items from the list.
					_this.$list.html('');

					// run after
					_this._moment('afterReset',[collection]);
				});
			
			// add each of the models to the list.
			_.each(collection.models, this._handleAdd);
		},

		_handleRemove: function(model) {
			// find the item to be removed
			var $item = this.retrieveElement(model),
				_this = this;

			this._moment('beforeRemove', [model, $item])
				.then(function() {
					$item.remove();

					_this._moment('afterRemove', [model]);
				});
		},


		/**
		 * Wraps the moment methods with promise-compliant
		 */
		_moment: function(name, args) {
			var moment = this[ name ];

			return typeof moment === 'function' ? $.when( moment.apply(this, args) ) : $.when( true );
		},

		/**
		 * API
		 */


		/**
		 * Method that retrieves the $el for a given backbone model.
		 * Uses the 'itemSelector' method.
		 */
		retrieveElement: function(model) {
			var selector = this.itemSelector(model),
				$el = this.$list.find(selector);

			return $el;
		},

	});

	return CollectionView;
});