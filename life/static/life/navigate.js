import fetchEverything from './fetch.js';
import {fadeOut, fadeIn, fadeTime, brighten, expandFromLeft, fontOpacityZeroToFull} from './animation.js';

function displayRank(GBIFResult, y)
{
	const r = GBIFResult;

	if (!r.resultOpenedFirstTime)
	{
		r.resultOpenedFirstTime = true;
		r.line1.style['border-color'] = r.taxaBlocks[taxaKeys.indexOf(r.targetRank)].style['background-color'];
		r.line2.style['border-color'] = r.taxaBlocks[taxaKeys.indexOf(r.targetRank)].style['background-color'];
	}
	
	if (r.resultOpened || (!r[r.targetRank].opened && !r.resultOpened)) // this if-else makes certain that you can open a GBIFResult by directly clicking on the targetRank taxaBlock, the only taxaBlock visible when GBIFResult is closed. Hence it must also make certain that you don't close the targetRank when you click on it while the GBIFResult is closed, but that in this case it stays opened (because earlier you left the targetRank opened when you closed the GBIFResult over the 'arrow').
	{
		if (r[taxaKeys[y]].opened) r[taxaKeys[y]].opened = false;
		else r[taxaKeys[y]].opened = true;
		if (!r.resultOpened) GBIFResultOpenClose(GBIFResult, false, r[taxaKeys[y]].openedFirstTime); // meaning taxaKeys[y] === targetRank
	}
	else
	{
		GBIFResultOpenClose(GBIFResult, false); // ...yes I could just use 'r' as a parameter, but I like to be "outspoken" when using parameters.
		return;
	}
	
	// console.log("CLICKED ON RANK "+taxaKeys[y]+". IS OPENED: "+r[taxaKeys[y]].opened);
			
	if (!r[taxaKeys[y]].openedFirstTime)
	{
		r[taxaKeys[y]].openedFirstTime = true;
		fetchEverything(GBIFResult, y);
		return;
	}
	
	let multiplicator = 0;
	if (r[taxaKeys[y]].info.className === 'rankDescription' && r[taxaKeys[y]].openedFirstTime) // the second if-condition makes certain that it doesn't instantly get hidden, when opening it for the first time. So for the first click, it goes to the 'else' and replaces 'rankDescription' with 'rankDescription', but that's not a problem.
	{
		for (const contentBlock of r[taxaKeys[y]].info.children) // cycles through the description blocks (center part) of a rank object like species
		{
			contentBlock.style.opacity = 1;
			setTimeout(()=>
			{
				contentBlock.animate(fadeOut, fadeTime/2).onfinish = ()=> contentBlock.style.opacity = 0;
			},(fadeTime/3)*multiplicator);
			multiplicator++;
			if (multiplicator === r[taxaKeys[y]].info.children.length) setTimeout(()=>
			{
				r[taxaKeys[y]].info.classList.replace('rankDescription', 'hidden');
				if (r.description.getBoundingClientRect().height === 0) r.line2.animate(fadeOut,fadeTime).onfinish = ()=> r.line2.style.display = 'none';
			},(fadeTime/3)*multiplicator);
		}
	}
	else
	{
		r[taxaKeys[y]].info.classList.replace('hidden', 'rankDescription');
		r.taxaBlocks[y].animate(brighten(r[taxaKeys[y]].color),fadeTime).onfinish = ()=> r.taxaBlocks[y].style['background-color'] = 'hsl('+r[taxaKeys[y]].color+', 70%, 70%)';
		for (const contentBlock of r[taxaKeys[y]].info.children)
		{
			contentBlock.style.opacity = 0;
			setTimeout(()=>
			{
				contentBlock.animate(fadeIn,fadeTime/2).onfinish = ()=> contentBlock.style.opacity = 1;
			},(fadeTime/3)*multiplicator);
			multiplicator++;
			if (multiplicator === r[taxaKeys[y]].info.children.length) setTimeout(()=>
			{
				if (r.description.getBoundingClientRect().height > 0)
				{
					r.line2.style.display = 'block';
					r.line2.animate(fadeIn, fadeTime);
				}
			},(fadeTime/3)*multiplicator);
		}
	}
}

function GBIFResultOpenClose(GBIFResult, calledFromArrow, targetRankOpenedBefore)
{
	if (targetRankOpenedBefore === undefined) targetRankOpenedBefore = true;
	// targetRankOpenedBefore is false if the GBIFResult has never been opened before but is now opened for the first time via clicking on the targetRank (instead of arrow). If so, this boolean will prevent for the description part to be faded-in, which does already happen in fetch.js which got executed simultaneously to this function as it was opened for first time, meaning it would flicker once (faded-in twice), if it wasn't for this check.
	const r = GBIFResult;
	const b = GBIFResult.taxaBlocks;

	if (!r.resultOpened)
	{
		r.arrow.animate(fadeOut,fadeTime/2);
		r.resultOpened = true;
		r.line1.style.display = 'block';
		r.description.style.display = 'flex';
		r.line2.style.display = 'block';
		r.images.style.display = 'block';
		r.mobileFullWidthImageDiv.style.display = 'block';
		r.mobileFullWidthImageDiv.animate(fadeIn, fadeTime);
		
		b[taxaKeys.indexOf(r.targetRank)].animate(fadeOut,fadeTime/2).onfinish = ()=>
		{
			r.arrow.style.opacity = 0;
			b[taxaKeys.indexOf(r.targetRank)].style.opacity = 0;
			
			for (const y of ranks)
			{
				if (r[taxaKeys[y]].opened) // checks which one were opened before to brigthen the taxaBlock background
				{
					b[y].animate(brighten(r[taxaKeys[y]].color, true),fadeTime).onfinish = ()=>	b[y].style['background-color'] = 'hsl('+r[taxaKeys[y]].color+', 70%, 70%)';
				}	
				if (taxaKeys[y] === r.targetRank)  // there only as many blocks until targetRank.
				{
					setTimeout(()=>
					{
						b[y].animate(expandFromLeft, fadeTime);
						b[y].animate(fadeIn, fadeTime).onfinish = ()=> b[y].style.opacity = 1;
						r.arrow.animate(fadeIn, fadeTime).onfinish = ()=> r.arrow.style.opacity = 1;
					},(fadeTime/1.5)*y);
					break;
				}
				setTimeout(()=>
				{
					b[y].style.display = "block";
					b[y].animate(fadeIn, fadeTime).onfinish = ()=> b[y].style.opacity = 1;
					b[y].animate(expandFromLeft, fadeTime).onfinish = ()=>
					{
						b[y].children[0].animate(fontOpacityZeroToFull(255,255,255,true),fadeTime).onfinish = ()=>{b[y].children[0].style.color = "rgba(255,255,255,1)"}
						b[y].children[1].animate(fontOpacityZeroToFull(255,255,255,true), fadeTime*2).onfinish = ()=>{ b[y].children[1].style.color = "rgba(255,255,255,1)"}
					}
				},(fadeTime/1.5)*y);
			}
			r.line1.animate({opacity: [0,0.5]}, fadeTime).onfinish = ()=>
			{
				r.line1.style.opacity = 0.5;
				if (targetRankOpenedBefore)
				{
					r.description.animate(fadeIn, fadeTime).onfinish = ()=>
					{
						r.description.style.opacity = 1;
						r.line2.animate({opacity: [0,0.5]}, fadeTime).onfinish = ()=>
						{
							r.line2.style.opacity = 0.5;
							r.images.animate(fadeIn, fadeTime).onfinish = ()=> r.images.style.opacity = 1;
						}
					}
				}
				else
				{
					r.line2.animate({opacity: [0,0.5]}, fadeTime).onfinish = ()=>
					{
						r.line2.style.opacity = 0.5;
						r.images.animate(fadeIn, fadeTime).onfinish = ()=> r.images.style.opacity = 1;
					}
				}
			}
			if (r.imagesObject.functionAddNextOccurrence !== null && r.images.scrollWidth === r.images.offsetWidth && r.resultOpenedSecondTime) {console.log('REMOTE FETCH CALL + continuing trying to fill white space with images'); r.imagesObject.functionAddNextOccurrence()}; // this is for the rather rare case when the user closes the GBIFResult BEFORE it had fetched enough images to fill the horizontal space. The checkWidth() function fires only once when the user opens a result for the first time, but it would get aborted (by a check in addNextImage()) if the user would close GBIFResult before it would fill the horizontal r.images. Hence this if-check when opening it again.
			r.resultOpenedSecondTime = true;
		}
	}
	else
	{
		for (const y of ranks)
		{ 	
			if (y < taxaKeys.indexOf(r.targetRank)) b[y].children[0].animate(fontOpacityZeroToFull(255,255,255,false), fadeTime).onfinish = ()=> b[y].children[0].style.color = "rgba(255,255,255,0)";
			if (y < taxaKeys.indexOf(r.targetRank)) b[y].children[1].animate(fontOpacityZeroToFull(255,255,255,false), fadeTime).onfinish = ()=> b[y].children[1].style.color = "rgba(255,255,255,0)";
			// I have to explicitly set the opacities of the two text-divs to 0, because the styling of rankClassification (first child) can get overwritten from the mouseout-event.
			setTimeout(()=>
			{
				if (y < taxaKeys.indexOf(r.targetRank)) b[y].children[1].style.color = "rgba(255,255,255,0)";
				setTimeout(()=>
				{
					r.arrow.animate(fadeOut,fadeTime).onfinish = ()=>{r.arrow.style.opacity = 0};
					b[y].animate(fadeOut, fadeTime).onfinish = ()=>
					{ 
						b[y].style.opacity = 0;

						if (taxaKeys[y] !== r.targetRank) b[y].style.display = "none";
						else b[y].animate(fadeIn,fadeTime).onfinish = ()=>
						{
							b[y].style.opacity = 1;
							if (r[taxaKeys[y]].opened) b[y].animate(brighten(r[taxaKeys[y]].color, false),fadeTime).onfinish = ()=> b[y].style['background-color'] = 'hsl('+r[taxaKeys[y]].color+', 50%, 50%)';
						}
						r.arrow.animate(fadeIn, fadeTime).onfinish = ()=> r.arrow.style.opacity = 1;
					}
				},fadeTime);
			},fadeTime);
		}
		r.images.animate(fadeOut, fadeTime/2).onfinish = ()=>
		{
			r.images.style.opacity = 0;
			r.line2.animate({opacity: [0.5,0]}, fadeTime/2).onfinish = ()=>
			{
				r.line2.style.opacity = 0;
				r.description.animate(fadeOut, fadeTime).onfinish = ()=>
				{
					r.description.style.opacity = 0;
					r.line1.animate({opacity: [0.5,0]}, fadeTime).onfinish = ()=>
					{
						r.line1.style.opacity = 0;
						r.line1.style.display = 'none';
						r.images.style.display = 'none';
						r.line2.style.display = 'none';
						r.description.style.display = 'none';
					}
				}
			}
		}
		r.resultOpened = false;
		r.mobileFullWidthImageDiv.animate(fadeOut, fadeTime).onfinish = ()=> r.mobileFullWidthImageDiv.style.display = 'none';
	}
	calledFromArrow = false;
}

export {displayRank, GBIFResultOpenClose};