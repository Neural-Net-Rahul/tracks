import { Request, Response, RequestHandler } from "express";
import { client } from "../app";

interface AuthenticatedRequest extends Request {
  id: number;
}

const trackData: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { trackId } = req.body;
    const userId = (req as AuthenticatedRequest).id;
    const track = await client.track.findFirst({
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
    const trackEA = await client.trackEditAccess.findFirst({
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
  } catch (e) {
    res.status(500).json({ message: "Error while creating track" });
    return;
  }
};

const prevPage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pageId, order, trackId } = req.body;

    if (!pageId || !order || !trackId) {
      res.status(400).json({
        message: "Missing required fields: pageId, order, or trackId.",
      });
      return;
    }

    const index = order.findIndex((id: number) => id === Number(pageId));

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
  } catch (error) {
    console.error("Error in prevPage:", error);
    res.status(500).json({
      message: "Internal server error: Unable to move to the previous page.",
    });
  }
};

const saveTrack: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, tags, order, trackId } = req.body;
    await client.track.update({
      where: {
        id: Number(trackId),
      },
      data: {
        name,
        tags,
        order,
        chaptersCount: order.length,
      },
    });
    res.status(200).json({ message: "Your track is saved" });
    return;
  } catch (e) {
    res.status(403).json({ message: "Error in saving data" });
    return;
  }
};

const savePage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pageId, chapterName, content } = req.body;
    await client.page.update({
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
  } catch (e) {
    res.status(403).json({ message: "Error in saving data" });
    return;
  }
};

const nextPage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { onPage, p_t_id, order } = req.body;
    if (!onPage) {
      if (order.length > 0) {
        res
          .status(202)
          .json({ message: "Sended you first page", id: order[0] });
        return;
      } else {
        res.status(201).json({ message: "There is no first page" });
        return;
      }
    }
    const index = order.findIndex((pageId: Number) => pageId === p_t_id);
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
  } catch (e) {
    res.status(500).json({ message: "Some error has occurred" });
    return;
  }
};

const deleteTrack: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { trackId } = req.body;
    await client.track.delete({
      where: {
        id: trackId,
      },
    });
    await client.page.deleteMany({
      where: {
        trackId: trackId,
      },
    });
    res.status(200).json({ message: "Track and Pages deleted" });
    return;
  } catch (e) {
    res.status(500).json({ message: "Some error occurred" });
    return;
  }
};

const deletePage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { pageId, order, trackId } = req.body;
    trackId = Number(trackId);
    pageId = Number(pageId);
    await client.page.delete({
      where: {
        id: pageId,
      },
    });
    const index = order.findIndex(
      (orderPageId: Number) => orderPageId === pageId
    );
    if (index === -1) {
      res.status(500).json({ message: "No page exists" });
      return;
    }
    const newOrder = order.filter(
      (orderPageId: Number) => pageId !== orderPageId
    );
    await client.track.update({
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
  } catch (e) {
    res.status(500).json({ message: "Some error occurred" });
    return;
  }
};

const createPage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { onPage, order, p_t_Id, trackId } = req.body;
    trackId = Number(trackId);
    const page = await client.page.create({
      data: {
        track: {
          connect: { id: trackId },
        },
      },
    });
    let newOrder = order;
    if (!onPage) {
      newOrder = [page.id, ...order];
    } else {
      const index = order.findIndex(
        (orderPageId: Number) => orderPageId === p_t_Id
      );
      let ord = []
      let ent = false;
      for(let i = 0;i<order.length;i++){
        if(i===index+1){
          ent = true;
          ord.push(page.id);
          ord.push(order[i]);
        }
        else{
          ord.push(order[i]);
        }
      }
      if(ent === false){
        ord.push(page.id);
      }
      newOrder = ord;
    }
    await client.track.update({
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
  } catch (e) {
    res.status(500).json({ message: "Some error occurred" });
    return;
  }
};

const sentPageData: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pageId } = req.body;
    const userId = (req as AuthenticatedRequest).id;
    const page = await client.page.findFirst({
      where: {
        id: pageId,
      },
    });
    if (!page) {
      res.status(500).json({ message: "Page does not exist" });
      return;
    }
    const trackId = page.trackId;
    const track = await client.track.findFirst({
      where: {
        id: trackId,
      },
    });
    const index = track!.order.findIndex((pageIds) => pageIds === pageId);
    const case1 = track!.userId === userId;
    if (case1) {
      res
        .status(200)
        .json({ message: "Giving page data", page, pageNo: index + 1, trackId:track!.id, order:track!.order});
      return;
    }
    const exists = await client.trackEditAccess.findFirst({
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
      .json({ message: "Giving page data", page, pageNo: index + 1, trackId:track!.id, order:track!.order });
    return;
  } catch (e) {
    res.status(500).json({ message: "Some error occurred" });
    return;
  }
};

const getEditorApiKey:RequestHandler = async(req:Request,res:Response):Promise<void> => {
  const API_KEY = "qe3bt2fc1ylqj7ecrgcumm4jx57ioujjs7gi8bvbfgwax45t";
  res.status(200).json({message:"Sending api key", api_key:API_KEY})
  return; 
}

const noTokenWatch:RequestHandler = async(req:Request,res:Response):Promise<void> => {
  let {pageId} = req.body;
  pageId = Number(pageId);
  const page = await client.page.findFirst({
    where:{
      id:pageId
    },
    include:{
      track:true
    }
  })
  if(!page){
    res
      .status(501)
      .json({ message: "Page does not exist" }); // send to home page in frontend
    return;
  }
  const isPublic = page?.track.isPublic;
  if(!isPublic){
    res.status(502).json({message:"You are not allowed to access this page"}); // send to home page in frontend
    return;
  }
  const order = page.track.order;
  if(order[0] === pageId){
    res
      .status(200)
      .json({ message: "You can access", page, order, pageNo:1 });
    return;
  }
  res.status(500).json({ message: "Please login to access this page." });
  return;
}

const tokenWatchPage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pageId } = req.body;
    const userId = (req as AuthenticatedRequest).id;
    const page = await client.page.findFirst({
      where: {
        id: pageId,
      },
    });
    if (!page) {
      res.status(500).json({ message: "Page does not exist" });
      return;
    }
    const trackId = page.trackId;
    const track = await client.track.findFirst({
      where: {
        id: trackId,
      },
    });
    const index = track!.order.findIndex((pageIds) => pageIds === pageId);
    const case1 = track!.userId === userId;
    if (case1 || track?.isPublic) {
      res.status(200).json({
        message: "Giving page data",
        page,
        pageNo: index + 1,
        trackId: track!.id,
        order: track!.order,
      });
      return;
    }
    const exists = await client.trackEditAccess.findFirst({
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
        trackId: track!.id,
        order: track!.order,
      });
    }
    
    const boughtExist = await client.trackBought.findFirst({
      where:{
        trackId, userId
      }
    })
    if(boughtExist){
      res.status(200).json({
        message: "Giving page data",
        page,
        pageNo: index + 1,
        trackId: track!.id,
        order: track!.order,
      });
      return;
    }
    res.status(500).json({
      message: "Do not have right to access",
    });
    return;
  } catch (e) {
    res.status(500).json({ message: "Some error occurred" });
    return;
  }
};


export {
  trackData,
  prevPage,
  saveTrack,
  savePage,
  nextPage,
  deleteTrack,
  deletePage,
  createPage,
  sentPageData,
  getEditorApiKey,
  noTokenWatch,
  tokenWatchPage,
};
