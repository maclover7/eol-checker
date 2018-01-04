const request = require('request-promise');

const eolData = [
  // CentOS
  // https://wiki.centos.org/FAQ/General
  'centos5',

  // Debian
  // https://wiki.debian.org/DebianReleases

  // Fedora
  // https://fedoraproject.org/wiki/End_of_life
  'fedora22',
  'fedora23',
  'fedora24',
  'fedora25',

  // Ubuntu
  // https://wiki.ubuntu.com/Releases
  'ubuntu1204',
  'ubuntu1210',
  'ubuntu1304',
  'ubuntu1310',
  'ubuntu1410',
  'ubuntu1504',
  'ubuntu1510',
  'ubuntu1610'
];

function getJenkinsComputer() {
  return request({
    url: 'https://ci.nodejs.org/computer/api/json?pretty=true',
    json: true
  });
}

function checkEol(computer) {
  return new Promise((resolve, reject) => {
    var os = computer.displayName.split('-')[2];

    // for example, 'master' fails this check
    if (os) {
      resolve({ displayName: computer.displayName, eol: eolData.includes(os) });
    } else {
      resolve({ displayName: computer.displayName, eol: false });
    }
  });
}

function printResults(computers) {
  var eolComputers = computers
    .filter((c) => { return c.eol; })
    // Group operating systems together
    .sort((a, b) => { return a.displayName.split('-')[2] > b.displayName.split('-')[2]; });

  console.log(`EOL Computers: (${eolComputers.length}/${computers.length})`);
  console.log('-----');
  for(const eolComputer of eolComputers) {
    console.log(eolComputer.displayName);
  }
  console.log('-----');
}

getJenkinsComputer()
.then((computers) => {
  return Promise.all(computers.computer.map((c) => { return checkEol(c) }));
})
.then(printResults);
