const asyncHandler = require('express-async-handler');
const tagsService = require('../services/tagsService');

/**
 * PUBLIC_INTERFACE
 * Controller for tags endpoints.
 */
class TagsController {
  list = asyncHandler(async (req, res) => {
    const tags = await tagsService.listTags();
    return res.status(200).json({ tags });
  });

  create = asyncHandler(async (req, res) => {
    const tag = await tagsService.createTag(req.body);
    return res.status(201).json({ tag });
  });
}

module.exports = new TagsController();
