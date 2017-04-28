const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

describe('transactions component controller', () => {
  beforeEach(angular.mock.module('app'));

  let $rootScope;
  let $scope;
  let $q;
  let controller;
  let $componentController;
  let account;
  let $peers;

  beforeEach(inject((_$componentController_, _$rootScope_, _$q_, _Account_, _$peers_) => {
    $componentController = _$componentController_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    account = _Account_;
    $peers = _$peers_;
  }));

  beforeEach(() => {
    $scope = $rootScope.$new();
    const mock = sinon.mock($peers);
    const deffered = $q.defer();
    mock.expects('listTransactions').returns(deffered.promise);
    mock.expects('listTransactions').returns(deffered.promise);
    controller = $componentController('transactions', $scope, {});
    account.set({
      passphrase: 'robust swift grocery peasant forget share enable convince deputy road keep cheap',
      balance: '0',
    });
  });

  describe('$onDestroy()', () => {
    it('cancels update timeout', () => {
      const spy = sinon.spy(controller.$timeout, 'cancel');
      controller.$onDestroy();
      expect(spy).to.have.been.calledWith(controller.timeout);
    });
  });

  describe('reset()', () => {
    it('sets this.loaded = false', () => {
      controller.loaded = true;
      controller.reset();
      expect(controller.loaded).to.equal(false);
    });
  });

  describe('update(show, more)', () => {
    let mock;

    beforeEach(() => {
      controller.$peers.listTransactions = () => {};
      mock = sinon.mock(controller.$peers);
      mock.expects('listTransactions').returns($q(() => {}));
    });

    it('sets this.loading = true', () => {
      controller.update();
      expect(controller.loading).to.equal(true);
    });

    it('sets this.loading_show = true if show == true', () => {
      controller.update(true);
      expect(controller.loading_show).to.equal(true);
    });

    it('doesn\'t change this.loading_show if show == false', () => {
      controller.update(false);
      expect(controller.loading_show).to.equal(undefined);
    });

    it('cancels update timeout', () => {
      const spy = sinon.spy(controller.$timeout, 'cancel');
      controller.update();
      expect(spy).to.have.been.calledWith(controller.timeout);
    });

    it('calls this.$peers.listTransactions(account.get().address, limit) with limit = 10 by default', () => {
      controller.$peers.listTransactions = () => {};
      mock = sinon.mock(controller.$peers);
      const transactionsDeferred = $q.defer();
      mock.expects('listTransactions').withArgs(account.get().address, 10).returns(transactionsDeferred.promise);
      controller.update();
      transactionsDeferred.reject();

      $scope.$apply();
      mock.verify();
      mock.restore();
    });
  });

  describe('_processTransactionsResponse(response)', () => {
    it('sets this.transactions = response.transactions', () => {
      const response = {
        transactions: [{}],
        count: 1,
      };
      controller._processTransactionsResponse(response);
      expect(controller.transactions).to.deep.equal(response.transactions);
    });

    it('sets this.more to how many more other transactions are there on server', () => {
      const response = {
        transactions: [{}, {}],
        count: 3,
      };
      controller._processTransactionsResponse(response);
      expect(controller.more).to.equal(response.count - response.transactions.length);
    });
  });

  describe('constructor()', () => {
    it('sets $watch on acount to run init()', () => {
      const mock = sinon.mock(controller);
      mock.expects('init').withArgs();
      account.set({ balance: 1000 });
      $scope.$apply();
      mock.verify();
      mock.restore();
    });

    it('sets to run reset() and update() $on "peerUpdate" is $emited', () => {
      const mock = sinon.mock(controller);
      mock.expects('reset').withArgs();
      mock.expects('update').withArgs(true);
      controller.$scope.$emit('peerUpdate');
      mock.verify();
      mock.restore();
    });
  });
});
