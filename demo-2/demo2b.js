(function()
{

	//exclude older browsers by the features we need them to support
	//and legacy opera explicitly so we don't waste time on a dead browser
	if
	(
		!document.querySelectorAll 
		|| 
		!('draggable' in document.createElement('span')) 
		|| 
		window.opera
	) 
	{ return; }

	//get the collection of draggable items and add their draggable attributes
	for(var 
		items = document.querySelectorAll('[data-draggable="item"]'), 
		len = items.length, 
		i = 0; i < len; i ++)
	{
		items[i].setAttribute('draggable', 'true');
		items[i].setAttribute('aria-grabbed', 'false');
		items[i].setAttribute('tabindex', '0');
	}
	
	

	//dictionary for storing the selections data 
	//comprising an array of the currently selected items 
	//and a reference to the selected items' owning container
	var selections = 
	{
		items : [],
		owner : null
	};
	
	//function for selecting an item
	function addSelection(item)
	{
		//if the owner reference is still null, set it to this item's parent
		//so that further selection is only allowed within the same container
		if(!selections.owner)
		{
			selections.owner = item.parentNode;
		}
		
		//or if that's already happened then compare it with this item's parent
		//and if they're not the same container, return to prevent selection
		else if(selections.owner != item.parentNode)
		{
			return;
		}
				
		//set this item's grabbed state
		item.setAttribute('aria-grabbed', 'true');
		
		//add it to the items array
		selections.items.push(item);
	}
	
	//function for unselecting an item
	function removeSelection(item)
	{
		//reset this item's grabbed state
		item.setAttribute('aria-grabbed', 'false');
		
		//then find and remove this item from the existing items array
		for(var len = selections.items.length, i = 0; i < len; i ++)
		{
			if(selections.items[i] == item)
			{
				selections.items.splice(i, 1);
				break;
			}
		}
	}
	
	//function for resetting all selections
	function clearSelections()
	{
		//if we have any selected items
		if(selections.items.length)
		{
			//reset the owner reference
			selections.owner = null;

			//reset the grabbed state on every selected item
			for(var len = selections.items.length, i = 0; i < len; i ++)
			{
				selections.items[i].setAttribute('aria-grabbed', 'false');
			}

			//then reset the items array		
			selections.items = [];
		}
	}

	//shorctut function for testing whether a selection modifier is pressed
	function hasModifier(e)
	{
		return (e.ctrlKey || e.metaKey || e.shiftKey);
	}



	//mousedown event to implement single selection
	document.addEventListener('mousedown', function(e)
	{
		//if the element is a draggable item
		if(e.target.getAttribute('draggable'))
		{
			//if the multiple selection modifier is not pressed 
			//and the item's grabbed state is currently false
			if
			(
				!hasModifier(e) 
				&& 
				e.target.getAttribute('aria-grabbed') == 'false'
			)
			{
				//clear all existing selections
				clearSelections();
			
				//then add this new selection
				addSelection(e.target);
			}
		}
		
		//else [if the element is anything else]
		//and the selection modifier is not pressed 
		else if(!hasModifier(e))
		{
			//clear all existing selections
			clearSelections();
		}

	}, false);
	
	//mouseup event to implement multiple selection
	document.addEventListener('mouseup', function(e)
	{
		//if the element is a draggable item 
		//and the multipler selection modifier is pressed
		if
		(
			e.target.getAttribute('draggable') 
			&& 
			hasModifier(e)
		)
		{
			//if the item's grabbed state is currently true
			if(e.target.getAttribute('aria-grabbed') == 'true')
			{
				//unselect this item
				removeSelection(e.target);
				
				//if that was the only selected item 
				//then reset the owner container reference			
				if(!selections.items.length)
				{
					selections.owner = null;
				}
			}
			
			//else [if the item's grabbed state is false]
			else
			{
				//add this additional selection
				addSelection(e.target);
			}
		}
		
	}, false);

	//dragstart event to initiate mouse dragging
	document.addEventListener('dragstart', function(e)
	{
		//if the element's parent is not the owner, then block this event
		if(selections.owner != e.target.parentNode)
		{
			e.preventDefault();
			return;
		}
				
		//[else] if the multiple selection modifier is pressed 
		//and the item's grabbed state is currently false
		if
		(
			hasModifier(e) 
			&& 
			e.target.getAttribute('aria-grabbed') == 'false'
		)
		{
			//add this additional selection
			addSelection(e.target);
		}
		
		//we don't need the transfer data, but we have to define something
		//otherwise the drop action won't work at all in firefox
		//most browsers support the proper mime-type syntax, eg. "text/plain"
		//but we have to use this incorrect syntax for the benefit of IE10+
		e.dataTransfer.setData('text', '');
	
	}, false);



	//keydown event to implement selection and abort
	document.addEventListener('keydown', function(e)
	{
		//if the element is a grabbable item 
		if(e.target.getAttribute('aria-grabbed'))
		{
			//Space is the selection or unselection keystroke
			if(e.keyCode == 32)
			{
				//if the multiple selection modifier is pressed 
				if(hasModifier(e))
				{
					//if the item's grabbed state is currently true
					if(e.target.getAttribute('aria-grabbed') == 'true')
					{
						//unselect this item
						removeSelection(e.target);
				
						//if that was the only selected item
						//then reset the owner container reference to null		
						if(!selections.items.length)
						{
							selections.owner = null;
						}
					}
					
					//else [if its grabbed state is currently false]
					else
					{
						//add this additional selection
						addSelection(e.target);
					}
				}

				//else [if the multiple selection modifier is not pressed]
				//and the item's grabbed state is currently false
				else if(e.target.getAttribute('aria-grabbed') == 'false')
				{
					//clear all existing selections
					clearSelections();
			
					//then add this new selection
					addSelection(e.target);
				}
			
				//then prevent default to supress any native actions
				e.preventDefault();
			}
		}
		
		//Escape is the abort keystroke (for any target element)
		if(e.keyCode == 27)
		{
			//if we have any selected items
			if(selections.items.length)
			{
				//clear all existing selections
				clearSelections();
				
				//but don't prevent default so native actions still occur
			}
		}
			
	}, false);
	
})();	
