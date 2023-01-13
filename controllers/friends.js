const User = require('../models/user.js');
const FriendRequest = require('../models/friend_request.js')

// all client.ids & user.ids will be placed in a set
var sockets = {}

const Client = async (io, client) => {
    /**
     * @description Client sends friend request to recipient
     * @param id user's id
     * 
     * If user joins succesfully
     * Then 
     *    -> server sends all friend requests as 'take-friend-request' to recipient
    */
    const id = client.user.user_id
    try {

        sockets = { ...sockets, id: client.id }
        sockets[id] = client.id

        console.log('Socket Joined Network');

        io.to(sockets[id]).emit('welcome', 'Welcome Client')

        var friendRequests = await FriendRequest.find({ recipient: id })
        friendRequests = friendRequests.filter(e => e.status === 'pending')

        io.to(sockets[id]).emit('take-friend-request', {
            count: friendRequests.length,
            senders: [...friendRequests.map(e => e.sender)],
        })
    } catch (err) {
        console.error(err);
    }
    client.on('disconnect', () => {
        const index = Object.values(sockets).findIndex(e => e === client.id)
        const id = Object.keys(sockets).at(index)
        if (id) {
            delete sockets[id];
            console.log(`Socket disconnected: ${client.id}`);
        }
    })
    /**
     * @description Client sends friend request to recipient
     * @param senderId sender user's id
     * @param recipientId recipient user's id
     * 
     * If FirendRequest created successfully
     * Then server sends message as 'take-friend-request' to recipient
     */
    client.on('send-friend-request', async (senderId, recipientId) => {
        try {
            await FriendRequest.create({
                sender: senderId,
                recipient: recipientId,
                status: 'pending'
            });
            console.log('Friend request created');

            if (!sockets[recipientId]) {
                throw new Error('Recipient user is not active')
            }

            io.to(sockets[recipientId]).emit('take-friend-request', {
                count: 1,
                senders: [senderId],
            })
            console.log('Friend request sended');

        } catch (err) {
            console.error(err);
        }
    });
    client.on('respond-friend-request', async (recipientId, senderId, response) => {
        try {
            if (!senderId) {
                throw new Error("Could not get user " + senderId)
            }
            if (!recipientId) {
                throw new Error("Could not get user " + recipientId)
            }
            const request = await FriendRequest.findOne(
                { sender: senderId, recipient: recipientId },
            );
            if (!request) {
                throw new Error('This friend request does not exists')
            }
            if (response === 'accepted') {
                // find users
                const senderUser = await User.findOne({ _id: senderId })
                const recipientUser = await User.findOne({ _id: recipientId })

                senderUser.friends = [...senderUser.friends, recipientId]
                recipientUser.friends = [...recipientUser.friends, senderId]

                User.updateOne(
                    { _id: senderId },
                    { friends: senderUser.friends },
                    (err, data) => {
                        if (err) {
                            if (err.kind === "not_found") {
                                throw new Error(`Not found User with id ${recipientId}.`)
                            } else {
                                throw new Error("Error updating User with id " + recipientId)
                            }
                        }
                    }
                );
                User.updateOne(
                    { _id: recipientId },
                    { friends: recipientUser.friends },
                    (err, data) => {
                        if (err) {
                            if (err.kind === "not_found") {
                                throw new Error(`Not found User with id ${senderId}.`)
                            } else {
                                throw new Error("Error updating User with id " + senderId)
                            }
                        }
                    }
                );
            }
            await FriendRequest.deleteOne(
                { sender: senderId, recipient: recipientId },
            );

            io.to([sockets[senderId], sockets[recipientId]])
                .emit('friend-request-response', { sender: senderId, response: response })

            console.log(`Friend request state is ${response}`);
        } catch (err) {
            console.error(err);
        }
    });
}

module.exports = { Client }