import { gql } from 'graphql-tag';

export const uploadTypeDefs = gql`
  enum UploadType {
    images
    videos
    files
  }

  enum UploadSortField {
    createdAt
    fileName
  }

  enum SortDirection {
    asc
    desc
  } 

  input UploadFilterInput {
    projectId: ID
    uploadedBy: ID
    mimeType: String
  }
    
  input UploadSortInput {
    field: UploadSortField = createdAt
    direction: SortDirection = desc
  }
  
  input PagingInput {
    limit: Int = 20
    offset: Int = 0
  }  

  input FileInput {
    fileName: String!
    mimeType: String!
    url: String!
    uploadedBy: String
    projectId: String
  }
  
  input VideoInput {
    fileName: String!
    mimeType: String!
    url: String!
    uploadedBy: String
    projectId: String
  } 

  type UploadUrlResult {
    uploadUrl: String!
    fileUrl: String!
    fileName: String! # <-- now included
  }

  type Image {
    _id: ID!
    fileName: String!
    mimeType: String!
    url: String!
    uploadedBy: String
    projectId: String
    createdAt: String!
  }

  input ImageInput {
    fileName: String!
    mimeType: String!
    url: String!
    uploadedBy: String
    projectId: String
  }

  type Video {
    _id: ID!
    fileName: String!
    mimeType: String!
    url: String!
    uploadedBy: String
    projectId: String
    createdAt: String!
  }

  type File {
    _id: ID!
    fileName: String!
    mimeType: String!
    url: String!
    uploadedBy: String
    projectId: String
    createdAt: String!
  }

  type UploadPageMeta {
    total: Int!
    hasMore: Boolean!
  }
  
  type ImagePage {
    data: [Image!]!
    meta: UploadPageMeta!
  }
  
  type VideoPage {
    data: [Video!]!
    meta: UploadPageMeta!
  }
  
  type FilePage {
    data: [File!]!
    meta: UploadPageMeta!
  }

  extend type Query {
    getImages(filter: UploadFilterInput, sort: UploadSortInput, paging: PagingInput): ImagePage!
    getVideos(filter: UploadFilterInput, sort: UploadSortInput, paging: PagingInput): VideoPage!
    getFiles(filter: UploadFilterInput, sort: UploadSortInput, paging: PagingInput): FilePage!
  }

  extend type Mutation {
    generateUploadUrl(type: UploadType!, fileName: String!): UploadUrlResult!
    registerImage(input: ImageInput!): Image!
    registerVideo(input: VideoInput!): Video!
    registerFile(input: FileInput!): File!
  }
`;
