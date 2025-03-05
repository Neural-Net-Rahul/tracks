"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTracks = exports.tokenWatchTrack = exports.noTokenWatchTrack = exports.tokenWatchPage = exports.noTokenWatch = exports.getEditorApiKey = exports.sentPageData = exports.createPage = exports.deletePage = exports.deleteTrack = exports.nextPage = exports.savePage = exports.saveTrack = exports.prevPage = exports.trackData = void 0;
const app_1 = require("../app");
const cloudinary_1 = require("../utils/cloudinary");
const trackData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackId } = req.body;
        const userId = req.id;
        const track = yield app_1.client.track.findFirst({
            where: {
                id: Number(trackId),
            },
            include: {
                pages: true,
                user: true,
            },
        });
        if (!track) {
            res.status(500).json({ message: "Track does not exist." });
            return;
        }
        const case1 = Number(track.userId) === Number(userId);
        if (case1) {
            res.status(200).json({ message: "You can access this track", track });
            return;
        }
        const trackEA = yield app_1.client.trackEditAccess.findFirst({
            where: {
                trackId,
                userId,
            },
        });
        if (!trackEA) {
            res.status(500).json({ message: "You don't have track access" });
            return;
        }
        res.status(200).json({ message: "You can now access the track", track });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Error while creating track" });
        return;
    }
});
exports.trackData = trackData;
const prevPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageId, order, trackId } = req.body;
        if (!pageId || !order || !trackId) {
            res.status(400).json({
                message: "Missing required fields: pageId, order, or trackId.",
            });
            return;
        }
        const index = order.findIndex((id) => id === Number(pageId));
        if (index === -1) {
            res
                .status(404)
                .json({ message: "Invalid pageId: Not found in order array." });
            return;
        }
        const prevPageId = index > 0 ? order[index - 1] : null;
        res
            .status(200)
            .json({ message: "Previous page data", trackId, prevPageId });
    }
    catch (error) {
        console.error("Error in prevPage:", error);
        res.status(500).json({
            message: "Internal server error: Unable to move to the previous page.",
        });
    }
});
exports.prevPage = prevPage;
const saveTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let { name, tags, order, trackId } = req.body;
        order = JSON.parse(order);
        tags = JSON.parse(tags);
        const image = ((_b = (_a = req.files.image) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) || '';
        let cloudinaryImageUrl = '';
        if (image) {
            cloudinaryImageUrl = yield (0, cloudinary_1.uploadOnCloudinary)(image);
            cloudinaryImageUrl = cloudinaryImageUrl.url;
        }
        yield app_1.client.track.update({
            where: {
                id: Number(trackId),
            },
            data: {
                name,
                tags,
                order,
                chaptersCount: order.length,
                image: cloudinaryImageUrl
            },
        });
        res.status(200).json({ message: "Your track is saved" });
        return;
    }
    catch (e) {
        res.status(403).json({ message: "Error in saving data" });
        return;
    }
});
exports.saveTrack = saveTrack;
const savePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageId, chapterName, content } = req.body;
        yield app_1.client.page.update({
            where: {
                id: pageId,
            },
            data: {
                chapterName,
                content,
            },
        });
        res.status(200).json({ message: "Your page is saved" });
        return;
    }
    catch (e) {
        res.status(403).json({ message: "Error in saving data" });
        return;
    }
});
exports.savePage = savePage;
const nextPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { onPage, p_t_id, order } = req.body;
        if (!onPage) {
            if (order.length > 0) {
                res
                    .status(202)
                    .json({ message: "Sended you first page", id: order[0] });
                return;
            }
            else {
                res.status(201).json({ message: "There is no first page" });
                return;
            }
        }
        const index = order.findIndex((pageId) => pageId === p_t_id);
        if (index === -1) {
            res.status(500).json({ message: "Page Id is not available in order" });
            return;
        }
        if (index + 1 === order.length) {
            res.status(203).json({ message: "There is no next page" });
            return;
        }
        res.status(208).json({ message: "Sended you next page", id: order[index + 1] });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error has occurred" });
        return;
    }
});
exports.nextPage = nextPage;
const deleteTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackId } = req.body;
        yield app_1.client.track.delete({
            where: {
                id: trackId,
            },
        });
        yield app_1.client.page.deleteMany({
            where: {
                trackId: trackId,
            },
        });
        res.status(200).json({ message: "Track and Pages deleted" });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.deleteTrack = deleteTrack;
const deletePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { pageId, order, trackId } = req.body;
        trackId = Number(trackId);
        pageId = Number(pageId);
        yield app_1.client.page.delete({
            where: {
                id: pageId,
            },
        });
        const index = order.findIndex((orderPageId) => orderPageId === pageId);
        if (index === -1) {
            res.status(500).json({ message: "No page exists" });
            return;
        }
        const newOrder = order.filter((orderPageId) => pageId !== orderPageId);
        yield app_1.client.track.update({
            where: {
                id: trackId,
            },
            data: {
                order: newOrder,
                chaptersCount: newOrder.length,
            },
        });
        if (index === 0) {
            res
                .status(200)
                .json({ message: "Page deleted", trackId, pageId: null, newOrder });
            return;
        }
        res
            .status(200)
            .json({
            message: "Page deleted",
            pageId: order[index - 1],
            trackId: null,
            newOrder,
        });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.deletePage = deletePage;
const createPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { onPage, order, p_t_Id, trackId } = req.body;
        trackId = Number(trackId);
        const page = yield app_1.client.page.create({
            data: {
                track: {
                    connect: { id: trackId },
                },
            },
        });
        let newOrder = order;
        if (!onPage) {
            newOrder = [page.id, ...order];
        }
        else {
            const index = order.findIndex((orderPageId) => orderPageId === p_t_Id);
            let ord = [];
            let ent = false;
            for (let i = 0; i < order.length; i++) {
                if (i === index + 1) {
                    ent = true;
                    ord.push(page.id);
                    ord.push(order[i]);
                }
                else {
                    ord.push(order[i]);
                }
            }
            if (ent === false) {
                ord.push(page.id);
            }
            newOrder = ord;
        }
        yield app_1.client.track.update({
            where: {
                id: trackId,
            },
            data: {
                order: newOrder,
                chaptersCount: newOrder.length,
            },
        });
        res.status(200).json({ message: "Page created", pId: page.id });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.createPage = createPage;
const sentPageData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageId } = req.body;
        const userId = req.id;
        const page = yield app_1.client.page.findFirst({
            where: {
                id: pageId,
            },
        });
        if (!page) {
            res.status(500).json({ message: "Page does not exist" });
            return;
        }
        const trackId = page.trackId;
        const track = yield app_1.client.track.findFirst({
            where: {
                id: trackId,
            },
        });
        const index = track.order.findIndex((pageIds) => pageIds === pageId);
        const case1 = track.userId === userId;
        if (case1) {
            res
                .status(200)
                .json({ message: "Giving page data", page, pageNo: index + 1, trackId: track.id, order: track.order });
            return;
        }
        const exists = yield app_1.client.trackEditAccess.findFirst({
            where: {
                trackId,
                userId,
            },
        });
        if (!exists) {
            res.status(500).json({ message: "You don't have access" });
            return;
        }
        res
            .status(200)
            .json({ message: "Giving page data", page, pageNo: index + 1, trackId: track.id, order: track.order });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.sentPageData = sentPageData;
const getEditorApiKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const API_KEY = "qe3bt2fc1ylqj7ecrgcumm4jx57ioujjs7gi8bvbfgwax45t";
    res.status(200).json({ message: "Sending api key", api_key: API_KEY });
    return;
});
exports.getEditorApiKey = getEditorApiKey;
const noTokenWatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { pageId } = req.body;
    pageId = Number(pageId);
    const page = yield app_1.client.page.findFirst({
        where: {
            id: pageId
        },
        include: {
            track: true
        }
    });
    if (!page) {
        res
            .status(501)
            .json({ message: "Page does not exist" }); // send to home page in frontend
        return;
    }
    const isPublic = page === null || page === void 0 ? void 0 : page.track.isPublic;
    if (!isPublic) {
        res.status(502).json({ message: "You are not allowed to access this page" }); // send to home page in frontend
        return;
    }
    const order = page.track.order;
    if (order[0] === pageId) {
        res
            .status(200)
            .json({ message: "You can access", page, order, pageNo: 1 });
        return;
    }
    res.status(500).json({ message: "Please login to access this page." });
    return;
});
exports.noTokenWatch = noTokenWatch;
const tokenWatchPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageId } = req.body;
        const userId = req.id;
        const page = yield app_1.client.page.findFirst({
            where: {
                id: pageId,
            },
        });
        if (!page) {
            res.status(500).json({ message: "Page does not exist" });
            return;
        }
        const trackId = page.trackId;
        const track = yield app_1.client.track.findFirst({
            where: {
                id: trackId,
            },
        });
        const index = track.order.findIndex((pageIds) => pageIds === pageId);
        const case1 = track.userId === userId;
        if (case1 || (track === null || track === void 0 ? void 0 : track.isPublic)) {
            res.status(200).json({
                message: "Giving page data",
                page,
                pageNo: index + 1,
                trackId: track.id,
                order: track.order,
            });
            return;
        }
        const exists = yield app_1.client.trackEditAccess.findFirst({
            where: {
                trackId,
                userId,
            },
        });
        if (exists) {
            res.status(200).json({
                message: "Giving page data",
                page,
                pageNo: index + 1,
                trackId: track.id,
                order: track.order,
            });
        }
        const boughtExist = yield app_1.client.trackBought.findFirst({
            where: {
                trackId, userId
            }
        });
        if (boughtExist) {
            res.status(200).json({
                message: "Giving page data",
                page,
                pageNo: index + 1,
                trackId: track.id,
                order: track.order,
            });
            return;
        }
        res.status(500).json({
            message: "Do not have right to access",
        });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.tokenWatchPage = tokenWatchPage;
const noTokenWatchTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { trackId } = req.body;
    const track = yield app_1.client.track.findFirst({
        where: {
            id: trackId,
        },
        include: {
            pages: true
        }
    });
    if (!track) {
        res.status(501).json({ message: "Track does not exist" }); // send to home page in frontend
        return;
    }
    const isPublic = track.isPublic;
    if (!isPublic) {
        res
            .status(502)
            .json({ message: "You are not allowed to access this track" }); // send to home page in frontend
        return;
    }
    res.status(200).json({ message: "Sending track...", track });
    return;
});
exports.noTokenWatchTrack = noTokenWatchTrack;
const tokenWatchTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackId } = req.body;
        const userId = req.id;
        const track = yield app_1.client.track.findFirst({
            where: {
                id: trackId,
            },
            include: {
                pages: true
            }
        });
        const case1 = track.userId === userId;
        if (case1 || (track === null || track === void 0 ? void 0 : track.isPublic)) {
            res.status(200).json({
                message: "Giving page data",
                track
            });
            return;
        }
        const exists = yield app_1.client.trackEditAccess.findFirst({
            where: {
                trackId,
                userId,
            },
        });
        if (exists) {
            res.status(200).json({
                message: "Giving page data",
                track
            });
        }
        const boughtExist = yield app_1.client.trackBought.findFirst({
            where: {
                trackId,
                userId,
            },
        });
        if (boughtExist) {
            res.status(200).json({
                message: "Giving page data",
                track
            });
            return;
        }
        res.status(500).json({
            message: "Do not have right to access",
        });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.tokenWatchTrack = tokenWatchTrack;
const getAllTracks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tracks = yield app_1.client.track.findMany({
            where: {
                isPublic: true
            }
        });
        res.status(200).json({ message: "Sending all tracks", tracks });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Error in fetching tracks" });
        return;
    }
});
exports.getAllTracks = getAllTracks;
