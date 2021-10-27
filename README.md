# EscapeGamee

start server with watch mode <br />
-- any change in .js .html .ts files will restart the server --

``` 
npm run dev 
```
access server at 
```
localhost:3000`
```

# Production 

build docker image 

```
docker build --tag escapegame:"__tagname" . // for example "docker build --tag escapegame:test ."
```

run docker 

``` 
docker run --name escapegame -p 3000:3000 -d escapegame:"__tagname"
```

stop docker 

```
docker kill escapegame 
docker rm escapegame
```

# git command
for set up remote 
https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories

clone repo
```
git clone https://github.com/latte34844/EscapeGame.git
```

pull changed code to local
```
git pull origin main
```

check  status (see changed from last commit)
```
git status
```

commit new change
```
git add .

git commit -m "{any comments}"

git push origin main
```
