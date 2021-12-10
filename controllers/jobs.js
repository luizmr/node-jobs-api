const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllJobs = async (req, res) => {
	const jobs = await Job.find({ createdBy: req.user.userId }).sort(
		'createdAt',
	);
	res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
	const {
		user: { userId },
		params: { id: jobId },
	} = req;

	const job = await Job.findOne({
		_id: jobId,
		createdBy: userId,
	});

	if (!job) {
		throw new NotFoundError(`No job with id ${jobId} was found`);
	}
	res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
	// create prop on body createdBy and pass req.user.userId from auth middleware
	req.body.createdBy = req.user.userId;
	const job = await Job.create(req.body);
	res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
	const {
		user: { userId },
		params: { id: jobId },
		body: { company, position },
	} = req;

	if (company === '' || position === '') {
		throw new BadRequestError(
			'Company or position fields can not be empty',
		);
	}

	const job = await Job.findByIdAndUpdate(
		{
			_id: jobId,
			createdBy: userId,
		},
		req.body,
		{
			new: true,
			runValidators: true,
		},
	);
	// third arg - must have for update
	// new -> returns on job the updated obj
	// runValidators -> run validators from schema

	if (!job) {
		throw new NotFoundError(`No job with id ${jobId} was found`);
	}

	res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
	const {
		user: { userId },
		params: { id: jobId },
	} = req;

	const job = await Job.findOneAndRemove({
		_id: jobId,
		createdBy: userId,
	});

	if (!job) {
		throw new NotFoundError(`No job with id ${jobId} was found`);
	}
	res.status(StatusCodes.OK).send();
};

module.exports = {
	getAllJobs,
	getJob,
	createJob,
	updateJob,
	deleteJob,
};
