define(['backbone.collectionview','backbone','jquery'], function(CollectionView, Backbone, $) {

	var Collection = Backbone.Collection.extend({
		comparator: function(model) {
			return model.get('id');
		},
	})

	var collection = window.collection = new Collection ([
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'pineapple' },
	]);

	var View = CollectionView.extend({
		itemData: function(model) {
			var defer = $.Deferred(),
				data = model.attributes;

			setTimeout(_.partial(defer.resolve, data), 1000);

			return defer;
		},

		itemTemplate: function(data) {
			return '<li id="'+ data.id +'"> id: ' + data.id +' - <span data-id="'+data.id+'">' + data.name +'</span></li>';
		},

		itemView: Backbone.View.extend({
			events: {
				'click span': 'lalala',
			},

			lalala: function(e) {
				alert($(e.currentTarget).attr('data-id'));
			}
		})
	});


	var view = new View({
		el: $('body'),
		list: $('#list'),
		collection: collection,
	});

});