# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

$script = <<SCRIPT
sudo apt-get update -y
sudo apt-get upgrade -y
pushd /home/ubuntu
mkdir .local
curl -o node.tar.xz https://nodejs.org/dist/v6.10.2/node-v6.10.2-linux-x64.tar.xz
tar xf node.tar.xz -C .local --strip-components=1
rm node.tar.xz
npm install -g surge
popd
SCRIPT

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.provider "virtualbox" do |vb|
    vb.cpus = 2
    vb.memory = 2048
  end
  config.vm.provision "shell", inline: $script, privileged: false
end
