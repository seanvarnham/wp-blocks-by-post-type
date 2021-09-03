import { subscribe } from "@wordpress/data";
import { unregisterBlockType, getBlockTypes } from "@wordpress/blocks";

wp.domReady(() => {
	// Create a fn to get the initial postType on page load
	const getPostType = () => select("core/editor").getCurrentPostType();
	// set the initial post type in the postType variable
	let postType = getPostType();

	/**
	 *  To de-register blocks across the WP installation use the generic
	 *  unregisterBlockType function.
	 */
	const deregisterBlocks = [
		"core/columns",
		"core/latest-posts",
		"core/buttons",
		"core/button",
		// etc...
	];

	deregisterBlocks.forEach((block) => {
		unregisterBlockType(block);
	});

	/**
	 *  To de-register blocks depending on which post-type you're currently
	 *  editing, you can use "subscribe":
	 *
	 *  https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/#subscribe
	 */

	/**
	 *  1.  Set up our de-registration function
	 *
	 *  @param {string} postType
	 */
	const deregisterBlocksByPostType = (postType) => {
		if (!postType) return null;
		/**
		 *  Define our allowed blocks as an empty array by default
		 *  We use "let" to enable read/write capabilities
		 */
		let allowedBlocks = [];

		/**
		 *  2.  Define our core block set that we want to allow on every post type
		 *      where we are going to manipulate the registered blocks.
		 *
		 *      The below blocks are a part of the WordPress core, but this can also
		 *      include any blocks from 3rd Party plugins or ones you've created on
		 *      your own.
		 */
		const coreBlocks = [
			"core/heading",
			"core/paragraph",
			"core/list",
			"core/image",
			"core/spacer",
		];

		/**
		 *  3.  Define our function which will be called to remove the blocks not
		 *      on our "allowed" list.
		 */
		const deregisterBlocks = (allowedBlocks) => {
			getBlockTypes().forEach((blockType) => {
				if (allowedBlocks.indexOf(blockType.name) === -1) {
					unregisterBlockType(blockType.name);
				}
			});
		};

		/**
		 *  4.  This is where we dictate what blocks we want to enqueue on a
		 *      post-by-post type basis. To do so, we compare the 'postType'
		 *      param to the post type of the content we are editing.
		 *
		 *      In this case, we're checking if we are editing a "page". If we are
		 *      then we will update our allowedBlocks array to include the core blocks
		 *      and any other's that we want to enable on pages.
		 */
		if ("page" === postType) {
			allowedBlocks = [
				...coreBlocks,
				"your-namespace/block-name",
				"your-namespace/block-name-2",
			];
		}

		/**
		 *  5.  Once the checking is complete, we check to see if there are any allowed
		 *      blocks. If there are then the de-registerBlocks function will run to
		 *      remove any blocks which we haven't specifically enabled above.
		 */
		if (allowedBlocks.length) deregisterBlocks(allowedBlocks);
	};

	/**
	 *  6.  Now we need to create our Subscribe listener
	 */
	const unsubscribe = subscribe(() => {
		/**
		 *  7.  Using our postType variable, if the type is defined then we can unsubscribe
		 *      from changes and run our de-register blocks function
		 */
		if (postType) {
			unsubscribe();
			deregisterBlocksByPostType(postType);
		}
	});
});
