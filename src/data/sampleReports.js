const sampleReports = [
  {
    reportId: '1',
    song: {
      _id: 'song1',
      title: 'Despacito',
      artist: 'Luis Fonsi & Daddy Yankee',
      songImage: 'https://i.scdn.co/image/ab67616d0000b273ef0d4234e1a645740f77d59c',
      fileUrl: 'https://example.com/despacito.mp3'
    },
    reporter: {
      _id: 'user1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    description: 'Bài hát này có lời không phù hợp và chứa nội dung người lớn',
    status: 'pending',
    createdAt: '2024-03-15T08:30:00.000Z'
  },
  {
    reportId: '2',
    song: {
      _id: 'song2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      songImage: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
      fileUrl: 'https://example.com/shape-of-you.mp3'
    },
    reporter: {
      _id: 'user2',
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    description: 'Vi phạm bản quyền: Bài hát này đã bị gỡ khỏi các nền tảng khác do vấn đề bản quyền',
    status: 'pending',
    createdAt: '2024-03-14T15:45:00.000Z'
  },
  {
    reportId: '3',
    song: {
      _id: 'song3',
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      songImage: 'https://i.scdn.co/image/ab67616d0000b273171d97fb52aea8e82a83ad93',
      fileUrl: 'https://example.com/bad-guy.mp3'
    },
    reporter: {
      _id: 'user3',
      name: 'David Chen',
      email: 'david.chen@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    description: 'Chất lượng âm thanh kém, nghi ngờ là bản thu lậu từ concert',
    status: 'pending',
    createdAt: '2024-03-13T10:20:00.000Z'
  },
  {
    reportId: '4',
    song: {
      _id: 'song4',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      songImage: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      fileUrl: 'https://example.com/blinding-lights.mp3'
    },
    reporter: {
      _id: 'user4',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    description: 'Bài hát bị cắt ngắn, không phải bản gốc hoàn chỉnh. Yêu cầu kiểm tra lại nguồn gốc bài hát.',
    status: 'pending',
    createdAt: '2024-03-12T09:15:00.000Z'
  },
  {
    reportId: '5',
    song: {
      _id: 'song5',
      title: 'Stay With Me',
      artist: 'Sam Smith',
      songImage: 'https://i.scdn.co/image/ab67616d0000b273f0e2c454d8ac6b8c46e43749',
      fileUrl: 'https://example.com/stay-with-me.mp3'
    },
    reporter: {
      _id: 'user5',
      name: 'Maria Garcia',
      email: 'maria.g@example.com',
      avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg'
    },
    description: 'Phiên bản cover không được sự cho phép của nghệ sĩ gốc. Người đăng tải đang mạo danh Sam Smith.',
    status: 'pending',
    createdAt: '2024-03-11T14:50:00.000Z'
  }
];

module.exports = sampleReports; 