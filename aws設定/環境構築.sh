#タイムゾーンを日本に
sudo timedatectl set-timezone Asia/Tokyo


#mongodb 3.2インストール
sudo cp mongodb-org-3.2.repo /etc/yum.repos.d/mongodb-org-3.2.repo
sudo yum install -y mongodb-org
sudo service mongod start

#nginxインストール
sudo cp nginx.repo /etc/yum.repos.d/nginx.repo
sudo yum install -y nginx
sudo cp -f default.conf /etc/nginx/conf.d/default.conf
#実行ユーザー無理やりnginxからcentosに
sudo vi /etc/nginx/nginx.conf

#nginxスタート
nginx

#ディレクトリ作成(~/)
mkdir client-dist

#javaインストール
sudo yum localinstall jdk-8u91-linux-x64.rpm 
#立ち上げ
nohup java -jar -Dspring.profiles.active=prod 2ch-0.0.1-SNAPSHOT.jar &

#mongo-expressダウンロード
curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
sudo yum install -y nodejs
npm i mongo-express
npm install -g forever
forever start app.js -u mongo -p majidesuzo


#立ち上げ系
sudo nginx
sudo service mongod start
nohup java -jar -Dspring.profiles.active=prod 2ch-0.0.1-SNAPSHOT.jar &