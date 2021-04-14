const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const axios = require('axios');

// Livereload.
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

const app = express();
const port = 3002;

liveReloadServer.server.once("connection", () => {
	setTimeout(() => {
		liveReloadServer.refresh("/");
	}, 100);
});

app.use(connectLivereload());

app.get('/', (req, res) => {
	// Get the friends list.
	const getFriends = () => {
		return axios
			.get('https://mauvelous-leopard-5257.twil.io/friends')
			.then(response => {
				const friends = [];

				response?.data?.friends.map( friend => {
					const username = friend.username;

					// We should do a check here whether a username already exists.
					friends.push({
						username: username,
						uri: `/users/${ username }`,
					});
				});

				return friends;
			}).catch(err => console.error(err));
	};

	// buildFriendList to return.
	const buildFriendsList = () => getFriends()
		.then(data => {
			// Build the friends URL list to be called in bulk.
			const friendsURL = data.map(friend => axios.get(`https://mauvelous-leopard-5257.twil.io/friend-detail?username=${ friend.username }`));
			const playURL = data.map(friend => axios.get(`https://mauvelous-leopard-5257.twil.io/plays-detail?username=${ friend.username }`));

			// Add friend count to original data.
			axios.all(friendsURL)
				.then(
					axios.spread((...responses) => {
						responses.forEach(response => {
							// Insert to original data.
							const username = response.data.uri.split('=')[1];

							const userIndex = data.findIndex(entry => entry.username === username);
							if ( userIndex !== -1 && response.data.friends.length !== 0 ) {
								const numberOfFriends = response.data.friends.length;
								data[userIndex]['friends'] = numberOfFriends;
							}
						});

						return data;
					})
				).then( () => {
					// Get all the play data.
					axios.all(playURL)
					.then(
						axios.spread((...responses) => {
							responses.forEach(response => {
								// Insert to original data.
								const username = response.data.uri.split('=')[1];

								const userIndex = data.findIndex(entry => entry.username === username);
								if ( userIndex !== -1 && response.data.plays.length !== 0 ) {
									const plays = response.data.plays;
									const numberOfPlays = plays.length;
									data[userIndex]['plays'] = numberOfPlays;
									data[userIndex]['tracks'] = [...new Set(plays)];
								}
							});

							res.status(200).json(data);
						})
					)
					.catch(err => console.error(err));
				}).catch(err => console.error(err));
		});

	buildFriendsList();
})

app.listen(port, () => {
	console.log('Running');
});
