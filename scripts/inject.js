try{
var contentSpacing = [...document.getElementsByClassName('contentSpacing')][0];
[...contentSpacing.children].forEach(e => {
    e.remove();
})
for(type of ['Albums','Singles and EPs','Compilations', 'Appears on', 'Other']) {
    var e = [...new DOMParser().parseFromString(`<section class="_9494f629d20c6ea6a999995720073c42-scss a8b052ab945f8d056679d7f3ff013e05-scss" aria-label="${type}"><div class="_5aac821edb25f0e281f50522021abbe4-scss _6424f268be3505ebab663700d60ebaa6-scss _7321ea8cd8e8baded34054347ab0be48-scss"><div class="_4e5e81e75ea1c55d3c6b7130e90b4e45-scss"><div class="_25ab18ebaa7323427b6a3ae748b2fdaa-scss"><div class="bd50070f7e4ffa804d8ad9fb0966c344-scss"><h2 class="c65f5ba184497ced74470e887c6a95c3-scss _15b259574e48922b106bc4b01521f33b-scss" as="h2">${type}</h2></div></div></div></div></section>`, 'text/html').body.children][0];
    contentSpacing.append(e);
}
var songTypes = [...document.getElementsByClassName('_9494f629d20c6ea6a999995720073c42-scss a8b052ab945f8d056679d7f3ff013e05-scss')];

var singles = songTypes.filter(e => e.getAttribute('aria-label').toString().toLowerCase().startsWith('single'))[0];
var albums = songTypes.filter(e => e.getAttribute('aria-label').toString().toLowerCase().startsWith('albums'))[0];
var comps = songTypes.filter(e => e.getAttribute('aria-label').toString().toLowerCase().startsWith('comp'))[0];
var appearon = songTypes.filter(e => e.getAttribute('aria-label').toString().toLowerCase().startsWith('appear'))[0];
var other = songTypes.filter(e => e.getAttribute('aria-label').toString().toLowerCase().startsWith('other'))[0];

data.forEach(musicPiece => {
    var temp = `
	<div class="_3802c04052af0bb5d03956299250789e-scss">
	<div class="b82dc570be22e5eec06a207e5da869ad-scss" draggable="true">
	<div class="react-contextmenu-wrapper ceaeb234f24dc8db48c4f9bf70618e01-scss">
	<div class="_2ce7a4a879bab3a4f4543c870c6d79fd-scss">
	<img aria-hidden="false" draggable="false" loading="lazy" src="${musicPiece.images[0].url || ""}" data-testid="card-image" alt="" class="_64acb0e26fe0d9dff68a0e9725b2a920-scss _810778d3df9b3dbdff12618620765fdf-scss">
	</div>
	<div class="_8ffcbd2689adedee867afcf5090b6fd4-scss">
	<a draggable="false" title="${musicPiece.name}" class="f7ebc3d96230ee12a84a9b0b4b81bb8f-scss" dir="auto" href="/album/${musicPiece.id}">
	<div class="_45331a50e3963ecc26575a06f1fd5292-scss _3957b7dd066dbbba6a311b40a427c59f-scss" as="div">${musicPiece.name}
	</div>
	</a>
	<div class="_3cfbde1fd9fecaaa77935664eeb6e346-scss _5f899d811cf206c5925f6450626fb0aa-scss" as="div">
	<time datetime="${musicPiece.release_date.slice(0,4)}">${musicPiece.release_date.slice(0,4)}
	</time>
	</div>
	</div>
	<div class="_3a2318b538bc2aae78113023036a879a-scss">
	<button class="_8e7d398e09c25b24232d92aac8a15a81-scss e8b2fe03d4e4726484b879ed8ff6f096-scss" title="Play" aria-label="Play" data-testid="play-button" style="--size:40px;">
	<svg height="16" role="img" width="16" viewBox="0 0 24 24" aria-hidden="true">
	<polygon points="21.57 12 5.98 3 5.98 21 21.57 12" fill="currentColor">
	</polygon>
	</svg>
	</button>
	</div>
	<div class="_0f1a8f7fdd1d622cbfe4c283f4f5cd72-scss">
	</div>
	</div>
	</div>
	</div>`
    switch(musicPiece.album_group) {
        case 'single':
            [...singles.children][0].append([...new DOMParser().parseFromString(temp, 'text/html').body.children][0]);
        break;
        case 'compilation':
            [...comps.children][0].append([...new DOMParser().parseFromString(temp, 'text/html').body.children][0]);
        break;
        case 'album':
            [...albums.children][0].append([...new DOMParser().parseFromString(temp, 'text/html').body.children][0]);
		break;
		case 'appears_on':
            [...appearon.children][0].append([...new DOMParser().parseFromString(temp, 'text/html').body.children][0]);
        break;
        default:
            [...other.children][0].append([...new DOMParser().parseFromString(temp, 'text/html').body.children][0]);
        break;
    };
});
} catch {};