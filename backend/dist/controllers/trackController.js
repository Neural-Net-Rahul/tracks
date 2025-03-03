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
exports.createPage = exports.deletePage = exports.deleteTrack = exports.nextPage = exports.savePage = exports.saveTrack = exports.prevPage = exports.trackData = void 0;
const app_1 = require("../app");
const trackData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackId } = req.body;
        const userId = req.id;
        const track = yield app_1.client.track.findFirst({
            where: {
                id: Number(trackId)
            },
            include: {
                pages: true,
                user: true
            }
        });
        if (!track) {
            res.status(500).json({ message: "Track does not exist." });
            return;
        }
        const case1 = (Number(track.userId) === Number(userId));
        if (case1) {
            res.status(200).json({ message: "You can access this track", track });
            return;
        }
        const trackEA = yield app_1.client.trackEditAccess.findFirst({
            where: {
                trackId, userId
            }
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
            res
                .status(400)
                .json({
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
        res
            .status(500)
            .json({
            message: "Internal server error: Unable to move to the previous page.",
        });
    }
});
exports.prevPage = prevPage;
const saveTrack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, tags, order, isPaid, isPublic, price, trackId } = req.body;
        yield app_1.client.track.update({
            where: {
                id: Number(trackId)
            },
            data: {
                name, tags, order, isPaid, isPublic, price, chaptersCount: order.length
            }
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
                chapterName, content
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
                res.status(202).json({ message: "Sended you first page", id: order[0] });
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
        res.status(204).json({ message: "Sended you next page", id: order[index + 1] });
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
                id: trackId
            }
        });
        yield app_1.client.page.deleteMany({
            where: {
                trackId: trackId
            }
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
                id: pageId
            }
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
            res.status(200).json({ message: "Page deleted", trackId, pageId: null, newOrder });
            return;
        }
        res.status(200).json({ message: "Page deleted", pageId: order[index - 1], trackId: null, newOrder });
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
        const { onPage, order, p_t_Id, trackId } = req.body;
        const page = yield app_1.client.page.create({
            data: {
                track: {
                    connect: { id: trackId }
                }
            }
        });
        let newOrder = order;
        if (!onPage) {
            newOrder = [page.id, ...order];
        }
        else {
            const index = order.findIndex((orderPageId) => orderPageId === p_t_Id);
            newOrder.splice(index + 1, 0, page.id);
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
        res.status(200).json({ message: "Page created", id: page.id });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Some error occurred" });
        return;
    }
});
exports.createPage = createPage;
