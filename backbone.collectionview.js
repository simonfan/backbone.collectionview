define(['backbone','underscore','_.asynch'], function(Backbone, undef, undef) {

	var CollectionView = Backbone.CollectionView = Backbone.View.extend({
		initialize: function(options) {
			/**
			 * Options:
			 *	- el: html list
			 *	- collection
			 *	- itemData: function that intercepts the model rendering
			 *	- itemTemplate: template function used to render the book itemnail.
			 *	- itemSelector: function that returns a selector used to find a specific item.
			 */
			/**
			 * The $list within which the items should be rendered.
			 */
			this.$list = options.list || this.$el;

			this.itemData = options.itemData || this.itemData;
			this.itemTemplate = options.itemTemplate || this.itemTemplate;
			this.itemSelector = options.itemSelector || this.itemSelector;

			// item-related methods
			_.bindAll(this,'itemData','itemTemplate','itemSelector');


			// event handlers
			_.bindAll(this,'_handleAdd','_handleReset','_handleRemove','_execAction','retrieveElement');


			// listen to events on the collection
			this.listenTo(this.collection, 'add', this._handleAdd)
				.listenTo(this.collection, 'remove', this._handleRemove)
				.listenTo(this.collection, 'reset', this._handleReset);

			// start things up.
			this.start(this.collection);
		},



		/**
		 * OVERWRITE METHODS
		 */
		
		start: function(collection) {
			this._handleReset(collection);
		},

		/**
		 * actions
		 */
		beforeAdd: function(model, $el) { $el.css('opacity', 0); },
		add: function(model, $el) { this.$list.append($el); },
		afterAdd: function(model, $el) { return $el.animate({ opacity: 1 }); },

		beforeRemove: function(model, $el) { return $el.animate({ opacity: 0 }); },
		remove: function(model, $el) { $el.remove(); },
		afterRemove: function(model) {},


		beforeReset: function(collection, $list) {},
		reset: function(collection, $list) {
			$list.html('');

			collection.each(this._handleAdd);
		},
		afterReset: function(collection, $list) {},

		beforeSort: function(collection, $list) {},
		sort: function(collection, $list) {},
		afterSort: function(collection, $list) {},


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
				// promise based render itemnail
				renderItem = $.when(itemData).then(this.itemTemplate),
				_this = this;

			// wait for the itemnail to be rendered to continue.
			renderItem.then(function(itemHtml) {
				var $item = $(itemHtml);

				_this._execActionSequence(['beforeAdd','add','afterAdd'], [model, $item]);
			});
		},

		_handleReset: function(collection, models) {
			this._execActionSequence(['beforeReset','reset','afterReset'], [collection, this.$list]);
		},

		_handleRemove: function(model) {
			// find the item to be removed
			var $item = this.retrieveElement(model);

			this._execActionSequence(['beforeRemove','remove','afterRemove'], [model, $item]);
		},

		/**
		 * Runs a sequence of actions.
		 */
		_execActionSequence: function(sequence, args) {
			var _this = this;

			// build the sequence up
			sequence = _.map(sequence, function(actionName) {
				return _.partial( _this._execAction, actionName, args);
			});

			return _.asynch.apply(null, sequence);
		},


		/**
		 * Wraps the action methods with promise-compliant
		 */
		_execAction: function(name, args) {
			var action = this[ name ],
				exec = typeof action === 'function' ? action.apply(this, args) : true;

			// if exec is undefined (thus the action has returned undefined), convert it to
			// true
			exec = typeof exec !== 'undefined' ? exec : true;

			return $.when(exec);
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