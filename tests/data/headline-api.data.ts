export const successfulUserUpdateResponse = {
  result: true,
  content: {
    result: 1,
  },
};

export const failedUserUpdateResponse = {
  result: false,
  content: {
    message: 'Mocked headline update failure',
  },
};

export const emptyHeadlineRequest = {
  headline: '',
};

export const userUpdateEndpoint = '/api/v1/user';

export const authStatusEndpoint = '/api/v1/auth/status';
