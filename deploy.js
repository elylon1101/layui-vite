import { scp } from 'scp2'

const config = {
    host: '',
    username: 'root',
    password: '',
    port: 22,
    path: '/root/test',
};

scp('./dist', config, err => {
    if (err) {
        console.error('上传失败：', err);
    } else {
        console.log('上传成功！');
    }
});
