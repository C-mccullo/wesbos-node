import axios from 'axios';
import { $ } from './bling';
function ajaxHeart(e) {
	e.preventDefault();
	console.log("fav'd ❤️");
	// will make post happen with js
	axios
		.post(this.action)
		.then(res => {
			console.log(this);
			// this.heart is the name attribute of the button
			const isHearted = this.heart.classList.toggle("heart__button--hearted");
			$(".heart-count").textContent = res.data.favourites.length;

			if(isHearted) {
				this.heart.classList.add("heart__button--float");
				setTimeout(()=> this.heart.classList.remove("heart__button--float"), 2500);
			}
		})
		.catch(err => console.log(err))
}

export default ajaxHeart;